async function shortestRoute(distMat, src){
  let len = distMat.length;
  let mask = Math.pow(2, len) - 1;
  let table = new Map();

  let run = async function (i, bitSet) {
    // DP
    let key = `${i},${bitSet}`;
    if (table.has(key)) return table.get(key);

    // base case
    if (bitSet === 0) return {distance: 0, chain: null};

    // find shortest next node
    let shortest = Infinity;
    let shortestChain = null;
    for (let j = 0; j < len; j++) {
      if (bitSet & (1 << j)) {
        let {distance, chain} = await run(j, bitSet & ~(1 << j));
        distance += distMat[i][j];
        if (distance < shortest) {
          shortest = distance;
          shortestChain = {node: j, next: chain};
        }
      }
    }

    // record and return result
    let ans = {distance: shortest, chain: shortestChain};
    table.set(key, ans);
    return ans;
  };

  let {distance, chain} = await run(src, mask & ~(1 << src));

  // recover path from chain
  let path = [src];
  while (chain !== null) {
    path.push(chain.node);
    chain = chain.next;
  }
  return {distance, path}
}

/**
 * Precaution:
 *  distMat.length <= 32
 *  0 <= src < distMat.length
 * Time complexity: O(N^2*2^N)
 * Space complexity: O(N*2^N)
 *
 * @param src
 * @param distMat
 * @returns {{distance: number, path: [null]}}
 */
function shortestRouteSync(distMat, src) {
  let len = distMat.length;
  let mask = Math.pow(2, len) - 1;
  let table = new Map();

  let run = function (i, bitSet) {
    // DP
    let key = `${i},${bitSet}`;
    if (table.has(key)) return table.get(key);

    // base case
    if (bitSet === 0) return {distance: 0, chain: null};

    // find shortest next node
    let shortest = Infinity;
    let shortestChain = null;
    for (let j = 0; j < len; j++) {
      if (bitSet & (1 << j)) {
        let {distance, chain} = run(j, bitSet & ~(1 << j));
        distance += distMat[i][j];
        if (distance < shortest) {
          shortest = distance;
          shortestChain = {node: j, next: chain};
        }
      }
    }

    // record and return result
    let ans = {distance: shortest, chain: shortestChain};
    table.set(key, ans);
    return ans;
  };

  let {distance, chain} = run(src, mask & ~(1 << src));

  // recover path from chain
  let path = [src];
  while (chain !== null) {
    path.push(chain.node);
    chain = chain.next;
  }
  return {distance, path}
}

function *permutation(values) {
  let N = values.length;
  let c = new Array(N).fill(0);
  yield values;
  let i = 0;
  function swap(arr, i, j){
    let t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  while (i < N) {
    if (c[i] < i) {
      if (i % 2 === 0) swap(values, 0, i);
      else swap(values, c[i], i);
      yield values;
      c[i] += 1;
      i = 0;
    }
    else {
      c[i] = 0;
      i += 1;
    }
  }
}

function dist(disMat, path) {
  let s = 0;
  for (let i = 1; i < path.length; i++) {
    s += disMat[path[i - 1]][path[i]];
  }
  return s;
}

function shortestRouteSlow(disMat, src) {
  let len = disMat.length;
  let points = [];
  for (let i = 0; i < len; i++) if (i !== src) points.push(i);

  let distance = Infinity;
  let path = [];
  for (let tail of permutation(points)) {
    let p = [src].concat(tail);
    let d = dist(disMat, p);
    if (d < distance) {
      distance = d;
      path = p;
    }
  }
  return {distance, path};
}

module.exports = {shortestRoute, shortestRouteSync, shortestRouteSlow, dist};