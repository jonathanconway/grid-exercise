# Grid Exercise

This application renders a grid of 0s and 1s, and allows you to count the number of continuous blocks of 1s.

0s are represented by 'empty' cells, 1s by 'filled' cells.

- Click on a square to view the number of continuous blocks of filled squares that are connected to it.
- Mouse-over a square to see those continuous blocks highlighted.
- Use a slider to control the size of (i.e. number of cells in) the grid.
- Use color pickers to control the colors used to render the grid.

## Running the program

Simply open the index.html file included in the solution.

## Technical notes

### Components

The application consists of:

- An HTML file that declares the elements that makes up the UI,
- A JS file which implements the rendering and behavior of the grid and the controls used to manipulate it, and
- A CSS file which implements the visual look and feel.

The JS file includes two classes:

* GridModel which constructs the grid and calculates the continuous blocks.
  * Continuous blocks are calculated using a recursive function (`getConnectedSquares`) which looks in each of the four valid directions for each connected square. The directions are kept in a map, allowing the solution to be extended to support diagonal squares or other kinds of more complex directional rules.

* GridPresenter which uses GridModel to render grid elements to the DOM and responds to events in the DOM by updating GridModel and the DOM.

### Tests

Unit tests can be found in `grid-tests.js`.

To run the unit tests, simply open `grid-tests.html`.

Currently only `GridModel` is covered by the tests. I isolated imperative UI code to the `GridPresenter` and tested that manually by clicking around in the UI.

### Areas for improvement

* The algorithm in `getConnectedSquares` could potentially be modified to use a loop and tracking variables rather than recursion. This would make the code slightly faster on older/slower machines, by avoiding function-call overhead. However it's probably not worth the effort.

* Perhaps there's a cleaner way of organising the components than the one I used. Classes don't add much value here, and it possibly would've been better to just use pure functions for most of the code.

* Unit testing could be made more thorough by covering more edge cases and covering the `GridPresenter` class.
