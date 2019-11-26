describe("GridModel", function() {

  describe("constructor", function() {
    it("should generate a grid with a default size of 5", function() {
      const gridModel = new GridModel();

      expect(gridModel.getSize()).toEqual(5);
      const grid = gridModel.getGrid();
      expect(grid.length).toEqual(5);
      expect(grid.every(row => row.length === 5)).toBeTruthy();
    });
  });

  describe("setSize", function() {
    it("should re-generate the grid with the size given", function() {
      ([10, 20, 100]).forEach(size => {
        const gridModel = new GridModel();

        gridModel.setSize(size);

        expect(gridModel.getSize()).toEqual(size);
        const grid = gridModel.getGrid();
        expect(grid.length).toEqual(size);
        expect(grid.every(row => row.length === size)).toBeTruthy();
      });
    });
  });

  describe("getConnectedSquares", function() {
    it("should get all and only the list of squares connected to the square at " +
       "the given co-ordinates", function() {

      const grid = [
        [1,0,0,0,1],
        [1,0,0,0,0],
        [1,0,0,1,1],
        [0,0,1,1,0],
        [1,0,0,1,0]
      ];

      const gridModel = new GridModel();

      gridModel.setGrid(grid);

      ([
        [[0, 0],
         [0, 1],
         [0, 2]],
        [        [3, 2], [4, 2],
         [2, 3], [3, 3],
                 [3, 4]]
      ])
      .forEach(combination => {
        combination.forEach(([ x, y ]) => {
          combination.forEach(([ combX, combY ]) => {
            expect(gridModel.getConnectedSquares(x, y)).toContain({ x: combX, y: combY });
          });
        });
      });

      ([             [4, 0],
        [0, 4]
      ])
      .forEach(([ x, y ]) => {
        expect(gridModel.getConnectedSquares(x, y)).toEqual([]);
      });

    });
  });

});
