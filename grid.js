/**
 * Grid functions
 * For analysing and manipulating the grid.
 */

/**
 * Gets the number of squares in `grid` that are touching the square at `x` and `y`.
 * Squares are connected if they are touching horizontally or vertically.
 * Ignores `visitedSquares`.
 */
function getConnectedSquares(grid, x, y, visitedSquares = []) {
  // How much to add/subtract from a square's co-ordinates, in order to move
  // in any of the valid directions.
  const directionOffsets = {
          up:     { y: -1, x: 0  },
          right:  { y: 0,  x: 1  },
          down:   { y: 1,  x: 0  },
          left:   { y: 0,  x: -1 },
        },

        offsets = Object.values(directionOffsets);

  let connectedSquares =
    offsets.map(offset => ({
      x: x + offset.x,
      y: y + offset.y
    }));

  // Exclude visited squares
  connectedSquares =
    connectedSquares.filter(connectedSquare =>
      !visitedSquares.includes(`${connectedSquare.x},${connectedSquare.y}`));

  // Exclude non-filled squares
  connectedSquares =
    connectedSquares.filter(connectedSquare =>
      (( grid[connectedSquare.y] || [] ) [ connectedSquare.x ] || 0) === 1);

  // For each connected square, get its connected squares.
  for (const connectedSquare of connectedSquares) {
    connectedSquares = [
      ...connectedSquares,
      ...(getConnectedSquares(
        grid,
        connectedSquare.x,
        connectedSquare.y,
        [
          ...connectedSquares.map(square => `${square.x},${square.y}`),
          ...visitedSquares
        ]))
    ];
  }

  return connectedSquares;
}

/**
 * Generates a map from each square's co-ordinates to a list of all that
 * square's connected squares.
 */
function generateConnectedSquaresMap(grid) {
  const connectedGroups = {};
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[0].length; y++) {
      if (grid[y][x] !== 1) {
        continue;
      }

      const coord = `${x},${y}`;
      if (!connectedGroups[coord]) {
        const connectedSquares = getConnectedSquares(grid, x, y);
        for (let square of connectedSquares) {
          connectedGroups[`${square.x},${square.y}`] = connectedSquares;
        }
      }
    }
  }
  return connectedGroups;
}

/**
 * Generates a 2-dimensional grid in which each cell has a value of either
 * 1 or 0, at random.
 * @param {number} size Number of cells in each row and column.
 * @returns {array[array]} Array of arrays.
 *   First-level array represents rows,
 *   Second-level array represents cells within a row.
 */
function generateRandomlyFilledGrid(size) {
  const grid = [];
  for (let y = 0; y < size; y++) {
    grid.push([]);
    for (let x = 0; x < size; x++) {
      grid[y].push(Math.round(Math.random()));
    }
  }
  return grid;
}

/**
 * Model of the grid and operations on the grid, such as finding a given square's 
 * connected squares.
 */
class GridModel {
  constructor(size) {
    this._size = size || 5;
    this._grid = generateRandomlyFilledGrid(this._size);
    this._generateConnectedSquaresMap();
  }

  _generateConnectedSquaresMap() {
    this._connectedSquaresMap = generateConnectedSquaresMap(this._grid);
  }

  getGrid() {
    return this._grid;
  }

  setGrid(grid) {
    this._grid = grid;
    this._size = grid.length;
    this._generateConnectedSquaresMap();
  }

  getSize() {
    return this._size;
  }

  setSize(size) {
    this._size = size;
    this._grid = generateRandomlyFilledGrid(this._size);
    this._generateConnectedSquaresMap();
  }

  getConnectedSquares(x, y) {
    return this._connectedSquaresMap[`${x},${y}`] || [];
  }
}

/**
 * Class responsible for presenting the GridModel via the DOM
 * and coordinating interactions between the DOM and the GridModel.
 */
class GridPresenter {
  /**
   * Constructs the GridPresenter.
   * @param {GridModel} gridModel Instance of gridModel to present.
   * @param {HtmlDocument} document Document on which to set any CSS variables.
   * @param {HtmlDivElement} gridEl Element whose HTML contents are set to the
   *                                full set of square elements.
   * @param {HtmlInputElement} gridSizeSliderEl
   *  Input element of type 'slider', used to adjust the grid size.
   * @param {HtmlInputElement} hoverColorPickerEl
   *  Input element of type 'color', used to adjust the hover color.
   * @param {HtmlInputElement} foregroundColorPickerEl
   *  Input element of type 'color', used to adjust the foreground color.
   * @param {HtmlInputElement} backgroundColorPickerEl
   *  Input element of type 'color', used to adjust the background color.
   */
  constructor(
    gridModel,
    document,
    gridEl,
    gridSizeSliderEl,
    hoverColorPickerEl,
    foregroundColorPickerEl,
    backgroundColorPickerEl
  ) {

    /**
     * Update the CSS variable that is used to layout the grid with the correct
     * number of columns.
     */
    function updateGridSizeVariable() {
      document.documentElement.style.setProperty('--grid-size', gridModel.getSize());
    }

    /**
     * Create the HTML elements for the squares and insert them into the DOM.
     */
    function renderSquares() {
      const gridHTML = `
        ${gridModel.getGrid().map((row, y) => `
          <div class="row">
            ${row.map((squareValue, x) => `
              <div class="square ${squareValue === 1 ? "filled" : ""}" data-x="${x}" data-y="${y}">
              </div>
            `).join("")}
          </div>
        `).join("")}
      `;

      gridEl.innerHTML = gridHTML;
    }

    /**
     * Return the x and y co-ordinates of the specified element.
     */
    function getCoordinatesOfSquareElement(el) {
            // Index of `el` within its parent.
      const x = [...el.parentNode.children].indexOf(el),
            // Index of `el` within its parent's parent.
            y = [...el.parentNode.parentNode.children].indexOf(el.parentNode);
      return { x, y };
    }

    /**
     * Add event listeners to the squares.
     *   - Click
     *   - MouseOver
     *   - MouseOut
     */
    function initSquares() {

      const squareEls = gridEl.getElementsByClassName('square');

      function clearAllSquares() {
        for (const squareEl of squareEls) {
          squareEl.innerHTML = "";
        }
      }

      function removeHoverEffectFromAllSquares() {
        for (const squareEl of squareEls) {
          if (squareEl.classList.contains('connected-hover')) {
            squareEl.classList.remove('connected-hover');
          }
        }
      }

      function isFilledSquare(el) {
        return el.classList.contains('square') && el.classList.contains('filled');
      }

      gridEl.addEventListener('click', function (event) {
        if (!isFilledSquare(event.target)) {
          return;
        }

        // Put the number of connected squares inside the clicked square.

        clearAllSquares();

        const { x, y } = getCoordinatesOfSquareElement(event.target),
              connectedSquares = gridModel.getConnectedSquares(x, y);

        event.target.innerHTML = connectedSquares ? connectedSquares.length : '';
      });

      gridEl.addEventListener('mouseover', function (event) {
        if (!isFilledSquare(event.target)) {
          return;
        }

        // Highlight all the squares connected to the moused-over square.

        const { x, y } = getCoordinatesOfSquareElement(event.target);

        const connectedSquares = gridModel.getConnectedSquares(x, y);
        if (!connectedSquares) {
          return;
        }

        removeHoverEffectFromAllSquares();

        for (const square of connectedSquares) {
          const selector = `.square[data-x="${square.x}"][data-y="${square.y}"]`,
                squareEl = gridEl.querySelector(selector);

          if (squareEl) {
            squareEl.classList.add('connected-hover');
          }
        }
      });

      gridEl.addEventListener('mouseout', function (event) {
        // Remove highlighting from all squares.

        removeHoverEffectFromAllSquares();
      });
    }

    /**
     * Add event listener to the size slider so that it modifies the grid size.
     */
    function initSizeSlider() {
      gridSizeSliderEl.value = gridModel.getSize();

      gridSizeSliderEl.addEventListener('input', function (event) {
        gridModel.setSize(event.target.value);

        // Update the DOM.
        updateGridSizeVariable();
        renderSquares();
      });
    }

    /**
     * Add event listeners to the color pickers, so that they modify the colors
     * used in the UI.
     */
    function initColorPickers() {
      ([
       ['hover', hoverColorPickerEl],
       ['foreground', foregroundColorPickerEl],
       ['background', backgroundColorPickerEl],
      ]).forEach(([ variable, el ]) => {
        // Set a default value.
        el.value =
          getComputedStyle(document.documentElement)
            .getPropertyValue(`--${variable}-color`)
            .toString()
            .trim();

        // On input, set a new value.
        el.addEventListener('input', function () {
          document
            .documentElement
            .style
            .setProperty(`--${variable}-color`, el.value);
        });
      });
    }

    updateGridSizeVariable();
    renderSquares();
    initSquares();
    initSizeSlider();
    initColorPickers();
  }
}

