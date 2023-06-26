import React, {Component} from 'react';
import Node from './Node/Node';
import {dijkstra} from '../algorithms/dijkstra';
import {dfs} from '../algorithms/dfs';
import bfs from '../algorithms/bfs';
//style sheet 
import './PathfindingVisualizer.css';
//unnamed default export
export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      START_NODE_ROW: 3,
      FINISH_NODE_ROW: 3,
      START_NODE_COL: 5,
      FINISH_NODE_COL: 25,
      mouseIsPressed: false,
      ROW_COUNT: 25,
      COLUMN_COUNT: 35,
      MOBILE_ROW_COUNT: 10,
      MOBILE_COLUMN_COUNT: 20,
      isRunning: false,
      isStartNode: false,
      isFinishNode: false,
      isWallNode: false, // xxxxxxx
      currRow: 0,
      currCol: 0,
      isDesktopView: true,
    };
//binds the methods to the state
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.toggleIsRunning = this.toggleIsRunning.bind(this);
  }
//after component mounting
  componentDidMount() {
    const ngrid = this.getInitialGrid();
    this.setState({grid:ngrid});
  }
  toggleIsRunning() {
    this.setState({isRunning: !this.state.isRunning});
  }
//to clear the grid
  toggleView() {
    if (!this.state.isRunning) {
      this.clearGrid();//called by () so no bind is required
      this.clearWalls();
      const isDesktopView = !this.state.isDesktopView;
      let grid;
      //if mobile view is enabled
      if (isDesktopView) {
        grid = this.getInitialGrid(
          this.state.ROW_COUNT,
          this.state.COLUMN_COUNT,
        );
        this.setState({isDesktopView, grid});
      } else {
        if (
          this.state.START_NODE_ROW > this.state.MOBILE_ROW_COUNT ||
          this.state.FINISH_NODE_ROW > this.state.MOBILE_ROW_COUNT ||
          this.state.START_NODE_COL > this.state.MOBILE_COLUMN_COUNT ||
          this.state.FINISH_NODE_COL > this.state.MOBILE_COLUMN_COUNT
        ) {
          alert('Start & Finish Nodes Must Be within 10 Rows x 20 Columns');
        } else {
          grid = this.getInitialGrid(
            this.state.MOBILE_ROW_COUNT,
            this.state.MOBILE_COLUMN_COUNT,
          );
          this.setState({isDesktopView, grid});
        }
      }
    }
  }

  //initial grid setting
  getInitialGrid = (
    rowCount = this.state.ROW_COUNT,
    colCount = this.state.COLUMN_COUNT,
  ) => {
    const rowGrid = [];
    for (let row = 0; row < rowCount; row++) {
      const currentRow = [];
      for (let col = 0; col < colCount; col++) {
        currentRow.push(this.createNode(row, col));
      }
      rowGrid.push(currentRow);
    }
    return rowGrid;
  };
//each node function
  createNode = (row, col) => {
    return {
      row,
      col,
      isStart:
        row === this.state.START_NODE_ROW && col === this.state.START_NODE_COL,
      isFinish:
        row === this.state.FINISH_NODE_ROW &&
        col === this.state.FINISH_NODE_COL,
      distance: Infinity,
      distanceToFinishNode:
        Math.abs(this.state.FINISH_NODE_ROW - row) +
        Math.abs(this.state.FINISH_NODE_COL - col),
      isVisited: false,
      isWall: false,
      previousNode: null,//for dfs,bfs,dijkstra
      isNode: true,
    };
  };

  //events controlling/events listners
  handleMouseDown(row, col) {
    if (!this.state.isRunning) {
      if (this.isGridClear()) {
        if (
          document.getElementById(`node-${row}-${col}`).className ===
          'node node-start'
        ) {
          this.setState({
            mouseIsPressed: true,
            isStartNode: true,
            currRow: row,
            currCol: col,
          });
        } else if (
          document.getElementById(`node-${row}-${col}`).className ===
          'node node-finish'
        ) {
          this.setState({
            mouseIsPressed: true,
            isFinishNode: true,
            currRow: row,
            currCol: col,
          });
        } else {//wall then no wall and no wall then wall only when not running
          const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
          this.setState({
            grid: newGrid,
            mouseIsPressed: true,
            isWallNode: true,
            currRow: row,
            currCol: col,
          });
        }
      } else {
        this.clearGrid();//when it is visited node or shortest path node clear the grid
      }
    }
  }
//to check if path has been created or not
  isGridClear() {
    for (const row of this.state.grid) {
      for (const node of row) {
        const nodeClassName = document.getElementById(
          `node-${node.row}-${node.col}`,
        ).className;
        if (
          nodeClassName === 'node node-visited' ||
          nodeClassName === 'node node-shortest-path'
        ) {
          return false;
        }
      }
    }
    return true;
  }
//to move start and finish nodes
  handleMouseEnter(row, col) {
    if (!this.state.isRunning) {
      if (this.state.mouseIsPressed) {
        const nodeClassName = document.getElementById(`node-${row}-${col}`)
          .className;
        if (this.state.isStartNode) {
          if (nodeClassName !== 'node node-wall') {
            const prevStartNode = this.state.grid[this.state.currRow][
              this.state.currCol
            ];
            prevStartNode.isStart = false;
            document.getElementById(
              `node-${this.state.currRow}-${this.state.currCol}`,
            ).className = 'node';

            this.setState({currRow: row, currCol: col});
            const currStartNode = this.state.grid[row][col];
            currStartNode.isStart = true;
            document.getElementById(`node-${row}-${col}`).className =
              'node node-start';
          }
          this.setState({START_NODE_ROW: row, START_NODE_COL: col});
        } else if (this.state.isFinishNode) {
          if (nodeClassName !== 'node node-wall') {
            const prevFinishNode = this.state.grid[this.state.currRow][
              this.state.currCol
            ];
            prevFinishNode.isFinish = false;
            document.getElementById(
              `node-${this.state.currRow}-${this.state.currCol}`,
            ).className = 'node';

            this.setState({currRow: row, currCol: col});
            const currFinishNode = this.state.grid[row][col];
            currFinishNode.isFinish = true;
            document.getElementById(`node-${row}-${col}`).className =
              'node node-finish';
          }
          this.setState({FINISH_NODE_ROW: row, FINISH_NODE_COL: col});
        } else if (this.state.isWallNode) {
          const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
          this.setState({grid: newGrid});
        }
      }
    }
  }
//to move start and finish nodes
  handleMouseUp(row, col) {
    if (!this.state.isRunning) {
      this.setState({mouseIsPressed: false});
      if (this.state.isStartNode) {
        const isStartNode = !this.state.isStartNode;
        this.setState({isStartNode, START_NODE_ROW: row, START_NODE_COL: col});
      } else if (this.state.isFinishNode) {
        const isFinishNode = !this.state.isFinishNode;
        this.setState({
          isFinishNode,
          FINISH_NODE_ROW: row,
          FINISH_NODE_COL: col,
        });
      }
      //this.getInitialGrid();
    }
  }
//after mouse leaves handling event
  handleMouseLeave() {
    if (this.state.isStartNode) {
      const isStartNode = !this.state.isStartNode;
      this.setState({isStartNode, mouseIsPressed: false});
    } else if (this.state.isFinishNode) {
      const isFinishNode = !this.state.isFinishNode;
      this.setState({isFinishNode, mouseIsPressed: false});
    } else if (this.state.isWallNode) {
      const isWallNode = !this.state.isWallNode;
      this.setState({isWallNode, mouseIsPressed: false});
      //this.getInitialGrid();
    }
  }

  //clear grid for button
//clears shortest path and visited nodes animation
  clearGrid() {
    if (!this.state.isRunning) {
      const newGrid = this.state.grid.slice();
      for (const row of newGrid) {
        for (const node of row) {
          let nodeClassName = document.getElementById(
            `node-${node.row}-${node.col}`,
          ).className;
          if (
            nodeClassName !== 'node node-start' &&
            nodeClassName !== 'node node-finish' &&
            nodeClassName !== 'node node-wall'
          ) {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              'node';
            node.isVisited = false;
            node.distance = Infinity;
            node.distanceToFinishNode =
              Math.abs(this.state.FINISH_NODE_ROW - node.row) +
              Math.abs(this.state.FINISH_NODE_COL - node.col);
          }
          if (nodeClassName === 'node node-finish') {
            node.isVisited = false;
            node.distance = Infinity;
            node.distanceToFinishNode = 0;
            node.isNode=true;
            node.isWall = false;
            node.previousNode = null;
            node.isFinish = true;
          }
          if (nodeClassName === 'node node-start') {
            node.isVisited = false;
            node.distance = Infinity;
            node.distanceToFinishNode =
              Math.abs(this.state.FINISH_NODE_ROW - node.row) +
              Math.abs(this.state.FINISH_NODE_COL - node.col);
            node.isStart = true;
            node.isWall = false;
            node.previousNode = null;
            node.isNode = true;
          }
        }
      }
    }
  }
//only walls to be cleared
  clearWalls() {
    if (!this.state.isRunning) {
      const newGrid = this.state.grid.slice();
      for (const row of newGrid) {
        for (const node of row) {
          let nodeClassName = document.getElementById(
            `node-${node.row}-${node.col}`,
          ).className;
          if (nodeClassName === 'node node-wall') {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              'node';
            node.isWall = false;
          }
        }
      }
    }
  }

  //animation creation
  visualize(algo) {
    if (!this.state.isRunning) {
      this.clearGrid();
      this.toggleIsRunning();//make it running
      const grid = this.state.grid;
      const startNode =
        grid[this.state.START_NODE_ROW][this.state.START_NODE_COL];
      const finishNode =
        grid[this.state.FINISH_NODE_ROW][this.state.FINISH_NODE_COL];
      let visitedNodesInOrder;
      switch (algo) {
        case 'Dijkstra':
          visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
          break;
        case 'BFS':
          visitedNodesInOrder = bfs(grid, startNode, finishNode);
          break;
        case 'DFS':
          visitedNodesInOrder = dfs(grid, startNode, finishNode);
          break;
        default:
          break;
      }
      const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
      nodesInShortestPathOrder.push('end');
      this.animate(visitedNodesInOrder, nodesInShortestPathOrder);
    }
  }

  animate(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {//shorted path only after entire visited nodes have been animated
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const nodeClassName = document.getElementById(
          `node-${node.row}-${node.col}`,
        ).className;
        if (
          nodeClassName !== 'node node-start' &&
          nodeClassName !== 'node node-finish'
        ) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-visited';//marking them visited,if they are not start and finish nodes
        }
      }, 10 * i);
    }
  }
  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      if (nodesInShortestPathOrder[i] === 'end') {
        setTimeout(() => {
          this.toggleIsRunning();//after the animation was ended toggle the running property of the state
        }, i * 50);
      } else {
        setTimeout(() => {
          const node = nodesInShortestPathOrder[i];
          const nodeClassName = document.getElementById(
            `node-${node.row}-${node.col}`,
          ).className;
          if (
            nodeClassName !== 'node node-start' &&
            nodeClassName !== 'node node-finish'
          ) {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              'node node-shortest-path';
          }
        }, i * 40);
      }
    }
  }

  render() {
    const grid=this.state.grid;
    const mouseIsPressed=this.state.mouseIsPressed;
    return (
      <div>
        <nav className="navbar navv navbar-dark  ">
          <div>
          <h3>Pathfinding-Visualizer</h3>
          </div>
        </nav>
        <div className="btnsp">
        <button
          type="button"
          className="btn btn-primary btn-lg active"
          onClick={() => this.visualize('Dijkstra')}>
          <p className="btntext">Dijkstra's Shortest Path</p>
        </button>
        <button
          type="button"
          className="btn btn-primary btn-lg active"
          onClick={() => this.visualize('BFS')}>
          <p className="btntext">Bread First Search</p>
        </button>
        <button
          type="button"
          className="btn btn-primary btn-lg active"
          onClick={() => this.visualize('DFS')}>
          <p className="btntext">Depth First Search</p>
        </button>
        </div>
        <table
          className="gd grid-container"
          onMouseLeave={() => this.handleMouseLeave()}>{/*on mouse leave if previous was start now make it not start*/}
          <tbody className="grid">
            {grid.map((row, rowIdx) => {
              return (
                <tr key={rowIdx}>
                  {row.map((node, nodeIdx) => {
                    const {row, col, isFinish, isStart, isWall} = node;//spreading
                    return (
                      <Node
                        key={nodeIdx}
                        col={col}
                        isFinish={isFinish}
                        isStart={isStart}
                        isWall={isWall}
                        mouseIsPressed={mouseIsPressed}
                        onMouseDown={(row, col) =>
                          this.handleMouseDown(row, col)
                        }
                        onMouseEnter={(row, col) =>
                          this.handleMouseEnter(row, col)
                        }
                        onMouseUp={() => this.handleMouseUp(row, col)}
                        row={row}></Node>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <button
          type="button"
          className="btn btn-danger btn-lg active"
          onClick={() => this.clearGrid()}>
          <p className="btntext">Clear Grid</p>
        </button>
        <button
          type="button"
          className="btn btn-warning btn-lg active"
          onClick={() => this.clearWalls()}>
          <p className="btntext">Clear Walls</p>
        </button>
        <div class="card" style={{width:"50rem",margin:"2px auto"}}>
  <img class="card-img-top" src={require("./bfs.jpg")} alt="bfs"/>
  <div class="card-body">
    <h5 class="card-title">BFS Algorithm</h5>
    <p class="card-text">BFS is a traversing algorithm where you should start traversing from a selected node (source or starting node) and traverse the graph layerwise thus exploring the neighbour nodes (nodes which are directly connected to source node). You must then move towards the next-level neighbour nodes.</p>
    <a href="https://www.hackerearth.com/practice/algorithms/graphs/breadth-first-search/tutorial/" target="_blank" class="btn btn-primary">For more</a>
  </div>
  </div>
  <div class="card" style={{width:"50rem",margin:"2px auto"}}>
  <img class="card-img-top" src={require("./dfs.jpg")} alt="bfs"/>
  <div class="card-body">
    <h5 class="card-title">DFS Algorithm</h5>
    <p class="card-text"> All the nodes will be visited on the current path till all the unvisited nodes have been traversed after which the next path will be selected.</p>
    <a href="https://www.hackerearth.com/practice/algorithms/graphs/depth-first-search/tutorial/" target="_blank" class="btn btn-primary">For more</a>
  </div>
  </div>
  <div class="card" style={{width:"50rem"}}>
  <img class="card-img-top" src={require("/Users/koushikmukka/pathfindingvisualizer2/src/PathfindingVisualizer/DFS.jpg.webp")} alt="bfs"/>
  <div class="card-body">
    <h5 class="card-title">Dijkstra Algorithm</h5>
    <p class="card-text"> The algorithm keeps track of the currently known shortest distance from each node to the source node and it updates these values if it finds a shorter path.</p>
    <a href="https://www.freecodecamp.org/news/dijkstras-shortest-path-algorithm-visual-introduction/" target="_blank" class="btn btn-primary">For more</a>
  </div>
  </div>
  </div>
    );
  }
}

//didnt work if new grid is not created when wall should be toggled
const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  if (!node.isStart && !node.isFinish && node.isNode) {
    const newNode = {
      ...node,
      isWall: !node.isWall,
    };
    newGrid[row][col] = newNode;
  }
  return newGrid;
};

// Backtracks from the finishNode to find the shortest path.
// Only works when called after the pathfinding methods.
function getNodesInShortestPathOrder(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}