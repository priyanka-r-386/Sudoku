//Sudoku Solver
//    d - digit
//    r - row
//    c - column
//    s - square, e.g. E5
//    u - unit, e.g. one whole row, column or box of squares.
const cross = (row, col) => {
    let c = [];
    for (let a in row) {
        for (let b in col) {
            c.push(row[a] + col[b])
        }
    }
    return c;
}

const contains = (item, list) => {
    for (let i in list)
        if (item == list[i])
            return true
    return false
}
const rows = ["A", "B", "C", "D", "E", 'F', 'G', 'H', 'I'];
const cols = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const digits = '123456789';
let squares = cross(rows, cols);//Simple list of all squares, [A1, A2, ..., I9]
let unitList = []; //List of all units. Each unit contains 9 squares. [ [A1,A2,...A9], [B1,B2,...,B9]...]


//Array of Columns
for (let c in cols)
    unitList.push(cross(rows, [cols[c]]))

//Array of Rows
for (let r in rows)
    unitList.push(cross([rows[r]], cols))

//Array of squares
let rows1 = [['A', 'B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'I']]
let cols1 = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']]
for (let rs in rows1) {
    for (let cs in cols1) {
        unitList.push(cross(rows1[rs], cols1[cs]));
    }
}


let units = {}//Units organized by square. UNITS['A1'] = [ ['A1'...'A9'], ['A1'...'I1'], ['A1'...'C3']]
let peers = {}//For each square, the list of other square that share a unit with it. PEERS['A1'] = ['A1', 'A2' ... 'H1','I1']
for (let s in squares) {
    unitsSquares = [];
    for (let u in unitList) {
        if (contains(squares[s], unitList[u]))
            unitsSquares.push(unitList[u])
    }
    units[squares[s]] = unitsSquares;
}


for (let s in squares) {
    peers[squares[s]] = {};
    for (let u in units[squares[s]]) {
        let ul = units[squares[s]][u];
        for (let s2 in ul)
            if (ul[s2] != squares[s])
                peers[squares[s]][ul[s2]] = true;
        }
}
let parse_grid = (grid) => {
    let grid2 = "";
    for (let c = 0; c < grid.length; c++)
        if ("0.-123456789".indexOf(grid.charAt(c)) >= 0)
            grid2 += grid.charAt(c);
    

    let values = {}
    for (let s in squares) {
        values[squares[s]] = digits;
    }
    for (let s in squares)
        if (digits.indexOf(grid2.charAt(s)) >= 0 && !assign(values, squares[s], grid2.charAt(s)))
            return false;
    return values
}
let elliminate = (values, square, digit) => {
    if (values[square].indexOf(digit) == -1)//Already Elliminated
        return values;

    values[square] = values[square].replace(digit, "");//Elliminating existing value from peers 

    if (values[square].length == 0)//Contradiction
        return false;
    else if (values[square].length == 1) { //If there is only one value (values[sq]) left in square, remove it from peers
        let result = true;
        for (let s in peers[square])//elliminating from peers
            result &= (elliminate(values, s, values[square]) ? true : false);
        if (!result) return false;
    }
    // If a unit u is reduced to only one place for a value d, then put it there.
    for(let u in units[square]){
        let dplaces = [];
        for (let s in units[square][u]) {
            let sq2 = units[square][u][s];
            if (values[sq2].indexOf(digit) != -1) {
                dplaces.push(sq2);
            }
        }
        if (dplaces.length == 0)//Contradiction: no place for this value
            return false;
        else if (dplaces.length == 1)//d can only be in one place in unit; assign it there
            if (!assign(values, dplaces[0], digit))
                return false;
    }

    return values;
}
let assign = (values, square, digit) => {
    let result = true;
    let value = values[square];
    for (let d = 0; d < value.length; d++)
        if (value.charAt(d) != digit) {
            result &= (elliminate(values, square, value.charAt(d)) ? true : false);
        } return (result ? values : false)
}


let dup = (obj) => {
    let d = {}
    for (let f in obj)
        d[f] = obj[f];
    return d;
}
//"Using depth-first search and propagation, try all possible values."
let search = (values) => {
    if (!values)
        return false;
    let min = 10, max = 1, sq = null;
    for (let s in squares) {
        if (values[squares[s]].length > max)
            max = values[squares[s]].length;
        if (values[squares[s]].length > 1 && values[squares[s]].length < min) {
            min = values[squares[s]].length;
            sq = squares[s];
        }
    }
    if (max == 1)// Solved
        return values;
    for (let d = 0; d < values[sq].length; d++){
        let res = search(assign(dup(values), sq, values[sq].charAt(d)));
        if (res)
            return res;
    }
    return false
}

let center = (s, w)=>{
    let excess = w - s.length;
    while (excess > 0) {
        if (excess % 2) s += " ";
        else s = " " + s;
        excess -= 1;
    }
    return s;
}

let board_string = (values) => {
    let width = 0;
    for (let s in squares)
        if (values[squares[s]].length > width)
            width = values[squares[s]].length;
    width += 1;
    let seg = "";
    for (let i = 0; i < width; i++)seg += "---";
    let line = "\n" + [seg,seg,seg].join("+");
    let board = "";
    for (let r in rows) {
        for (let c in cols) {
            board += center(values[rows[r] + cols[c]], width);
            if (c == 2 || c == 5) board += "|";
        }
        if (r == 2 || r == 5) board += line;
        board += "\n";
    }
    board += "\n";
    return board;
}
 




