const {shortestRoute, shortestRouteSync, shortestRouteSlow, dist} = require('../src/lib/algorithm/ShortestRoute');
const expect = require('expect');

describe('ShortestRoute', function () {

  it('should return distance and path', async function () {
    let res = await shortestRoute([
      [0, 1, 3],
      [1, 0, 1],
      [2, 3, 0]
    ], 1);
    expect(res).toHaveProperty('path');
    expect(res).toHaveProperty('distance');
    expect(res.path).toHaveLength(3);
  });

  it('should return same result as shortestRouteSlow', async function () {
    this.timeout(100 * 1000);

    for (let len = 5; len < 10; len++) {
      let len = 10;
      let mat = new Array(len).fill(null).map(i => new Array(len).fill(0));

      for (let i = 0; i < len; i++) {
        for (let j = 0; j < len; j++) {
          if (i === j) continue;
          mat[i][j] = 1 + (i * j) % 5;
        }
      }

      for (let i = 0; i < len; i++) {
        let a1 = await shortestRoute(mat, i);
        let a2 = shortestRouteSlow(mat, i);
        expect(a1.distance).toBe(a2.distance);
        expect(dist(mat, a1.path)).toBe(dist(mat, a2.path));
      }
    }
  });

  it('time test', async function () {
    let len = 15;
    let mat = new Array(len).fill(null).map(i => new Array(len).fill(0));

    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len; j++) {
        if (i === j) continue;
        mat[i][j] = 1 + (i * j) % 5;
      }
    }

    shortestRoute(mat, 0);
  })

});