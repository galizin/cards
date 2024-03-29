if (!Array.prototype.last){
    Array.prototype.last = function(){
        if(this.length === 0)
            return null;
        else
            return this[this.length - 1];
    };
};

class Card {
  constructor(suit,no,vis) {
    this.suit = suit;
    this.no = no;
    this.vis = vis;
  }
  static cardId(card) {
    return card.no.toString(16) + card.suit.toString(16);
  }
  static cardEl(card) {
    return($("#" + Card.cardId(card))[0]);
  }
  id() {
    return Card.cardId(this);
  }
  el() {
    return Card.cardEl(this);
  }
  color() {
    return [1, 2].includes(this.suit) ? "red" : "black";
  }
}

class Stack {
  constructor () {
    this.clear();
  }
  clear() {
    this.el = [];
  }
  len() {
    return this.el.length;
  }
  last() {
    if(this.len() === 0) {
      return null;
    } else {
      return  this.el[this.len() - 1];
    }
  }
  visLast() {
    if (this.len() > 0) {
      const chvis  = this.last().vis !== true;
      this.last().vis = true;
      return chvis;
    }
    return false;
  }
  invisLast() {
    if (this.len() > 0) {
      const chvis  = this.last().vis !== false;
      this.last().vis = false;
      return chvis;
    }
    return false;
  }
  idx(id) {
    return this.el.map(m => m.id()).indexOf(id);
  }
}

class History {
  constructor() {
    this.clear();
  }
  clear() {
    this.h = [];
    this.p = -1;
  }
  push(cmd, redo) {
    if(redo) {
      return;
    }
    if (this.h.length !== (this.p + 1)) {
      this.h.splice(this.p + 1);
    }
    if (this.p === (this.h.length - 1)) {
      this.h.push(cmd);
    }
    this.p++;
    //console.log("history step: " + this.p);
  }
  pop() {
    if(this.p > -1) {
      this.p--;
      return this.h[this.p + 1];
    }
  }
  next() {
    if(this.p < (this.h.length - 1)) {
      this.p++;
      return this.h[this.p];
    }
  }
}

const shuffleDeck = function() {
  const initDeck = function(deck) {
    for(let suits = 0; suits < 4; suits++) {
      for(let nos = 0; nos < 13; nos++) {
        deck.push(new Card(suits, nos, false));
      }
    }
    return deck;
  }
  const deck = initDeck([]);
  const deck2 = [];
  while(deck.length > 0) {
    let idx = Math.floor(Math.random() * deck.length);
    deck2.push(deck[idx]);
    deck.splice(idx, 1);
  }
  return deck2;
}

let deck = [];

let history = new History();

let histPoint = -1;

const main=[];

for(let i = 0; i < 7; i++) {
  main.push(new Stack());
}

const discard=[];

for(let i = 0; i < 4; i++) {
  discard.push(new Stack());
}

const stack=[new Stack(), new Stack()];

replay = function (isSame) {

  for(let i = 0; i < 7; i++) {
    main[i].clear();
  }

  for(let i = 0; i < 4; i++) {
    discard[i].clear();
  }

  stack[0].clear();
  stack[1].clear();

  if(!isSame) {
    deck = shuffleDeck();
  }

  const deckCopy = [...deck];

  deckCopy.forEach(m => stack[1].el.push(m));

  for(let i = 0; i < 7; i++) {
    for(let j = i; j < 7; j++) {
      if (j == i) {
        stack[1].el[0].vis = true;
      } else {
        stack[1].el[0].vis = false;
      }
     main[j].el.push(stack[1].el[0]);
     stack[1].el.splice(0, 1);
   }
  }

  stack[1].el.forEach(m => m.vis = true);
  history.clear();
  drawField();
}

var hGap = 3;
var hDim = Math.min(Math.floor((window.innerWidth - hGap * 8) / 7),50);
var vGap = 3;
var vDim = 55;
var shft = Math.min(Math.floor((document.documentElement.clientHeight - 2*(vGap + vDim))/18), 25);  //18;
var border = 2;

function elMove(el) {
  $(el).attr("ontouchstart", "dragstart_handler(event)").attr("ontouchend", "drop_handler(event)")
    .attr("ontouchmove","dragover_handler(event)").attr("draggable", "true").attr("ondragstart", "drag(event)");
  let found = $(el).find(".innerspan");
  if(found) {
    found.removeClass("transparent");
  }
}

function elFix(el) {
  $(el).attr("ontouchstart", "").attr("ontouchend", "").attr("ontouchmove","").attr("draggable", "false").attr("ondragstart", "");
  let found = $(el).find(".innerspan");
  if(found) {
    found.addClass("transparent");
  }
}

function dropTarget(el) {
  $(el).attr("ondrop","drop(event)").attr("ondragover","allowDrop(event)");
}

function nonDropTarget(el) {
  $(el).attr("ondrop","").attr("ondragover","");
}

cardString = function(card) {
    const red = card.color() === "red"; //suit == 1 || suit == 2 ? 1 : 0;
    const suitname = ["&spades;","&hearts;","&diams;","&clubs;"][card.suit];
    const cardname = ['A','2','3','4','5','6','7','8','9','1', 'J', 'Q', 'K'][card.no];
    const el = document.createElement("span");
    $(el).attr("class", "outerspan").attr("id", card.id()).css("height", vDim - border*2 + "px").css("width", hDim - border*2 + "px");
    $(el).html((red ? '<mark class="red">' : '') + '<span class="innerspan">' + cardname + suitname + '</span>' + (red ? '</mark>' : ''));
    return el;
};

cardSpan = function(card) {
    const suitname = ["&spades;","&hearts;","&diams;","&clubs;"][card.suit];
    const cardname = ['A','2','3','4','5','6','7','8','9','1', 'J', 'Q', 'K'][card.no];
    return "<span style=\"font-family:Cards;color:" + card.color() + ";\">" + cardname + suitname +  "</span>";
}

nonCardString = function(suit, top, left, suitNo) {
    let red = suit == "hearts" || suit == "diams" ? 1 : 0;
    let el = document.createElement("span");
    $(el).attr("class", "outerspan").attr("style", "top:" + top + "px; left:" + left + "px")
      .css("height", vDim - border*2 + "px").css("width", hDim - border*2 + "px");
    if (suit === "") {
        $(el).attr("onclick", "procCmd('a'); drawField();").attr("id", "stackoverturn").html('<span class="innerspan" />');
    } else {
        $(el).attr("id", suitNo);
        dropTarget(el);
    }
    return el;
};

function dragstart_handler(ev) {
    ev.preventDefault();
    const touches = ev.changedTouches;
    const el = ev.target.closest(".outerspan");
    if(el) {
      const viewportOffset = el.getBoundingClientRect();
        $(el).parents("span.outerspan").css("height", vDim - 2*border+ "px");
      $(el).attr("touchstartoffset", (-viewportOffset.top + touches[0].pageY) + ',' + (-viewportOffset.left + touches[0].pageX)) //.addClass("move")
        .appendTo("#main");
    }
}

function dragover_handler(ev) {
    ev.preventDefault();
    const touches = ev.changedTouches;
    let el = ev.target.closest(".outerspan");
    if (el /*&& $(el).hasClass("move")*/) {
      let sh = 0;
            let offs = $(el).attr("touchstartoffset");
            el.style.top = (touches[0].pageY - Number(offs.split(',')[0])) + 'px';
            el.style.left = (touches[0].pageX - Number(offs.split(',')[1])) + 'px';
      for (let child of $(el).find('.outerspan')) {
             sh += shft;
         child.style.top = parseInt(el.style.top) + sh + 'px';
         child.style.left = el.style.left;
      }
    }
}

function drop_handler(ev) {
    ev.preventDefault();
    const touches = ev.changedTouches;
    let el = ev.target.closest(".outerspan");
    if (el) {
      const hcoord = parseInt(el.style.left) + hDim/2;
      const vcoord = parseInt(el.style.top) + vDim/2;
      coord2move(el.id, hcoord, vcoord);
    }
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("cardid", ev.target.id);
  ev.dataTransfer.setData("hoff", parseInt($(ev.target).css("left")) + hDim/2 - ev.clientX);
  ev.dataTransfer.setData("voff", parseInt($(ev.target).css("top")) + vDim/2 - ev.clientY);
}

function move2cmd(from, hlane, vlane) {
  function isSM(a) {
    if(stack[0].last() && stack[0].last().id() === a) {
      return [7, 1];
    }
    for(let i = 0; i < 7; i++) {
      const idx = main[i].idx(a);
      if (idx !== -1) {
        return [i, main[i].len() - idx];
      }
    }
    return [-1, 1];
  }
  function isD(a) {
    for(let i = 0; i < 4; i++) {
      if (discard[i].idx(a) !== -1) {
        return i;
      }
    }
    return ["0", "1", "2", "3"].indexOf(a);
  }
  fromSM = isSM(from);
  fromD = isD(from);
  if(fromSM[0] > -1 && vlane === 1) {
    procCmd('s ' + fromSM[0] + ' ' + hlane + ' ' + fromSM[1]); //howmany
  }
  if(fromSM[0] > -1 && vlane === 0) {
    procCmd('r ' + fromSM[0] + ' ' + hlane);
  }
  if(fromD > -1 && vlane === 0) {
    procCmd('u ' + fromD + ' ' + hlane);
  }
  if(fromD > -1 && vlane === 1) {
    procCmd('b ' + fromD + ' ' + hlane);
  }
}

function coord2move(id, hcoord, vcoord) {
    const hlane = Math.floor(hcoord / (hGap + hDim));
    let vlane;
    if (vcoord > vGap && vcoord < (vGap + vDim)) {
      vlane = 0;
    }
    if (vcoord > (2*vGap + vDim)) {
      vlane = 1;
    }
    if ([0,1].includes(vlane) && (hcoord - hlane*(hGap + hDim) > 4) && (hlane > -1) && (hlane < 7) && (vlane === 0 ? (hlane < 4) : true)) {
      move2cmd(id, hlane, vlane);
    }
    drawField();
}

function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("cardid");
  const hoff = ev.dataTransfer.getData("hoff");
  const voff = ev.dataTransfer.getData("voff");
  if(ev.currentTarget.id === "main") {
    const hcoord = parseFloat(hoff) + ev.clientX;
    const vcoord = parseFloat(voff) + ev.clientY;
    coord2move(data, hcoord, vcoord);
    return;
  }
}

let drawStack = function(arr) {
  let parentEl = null;
  for(let j = 0; j < arr.el.length; j++) {
    let currEl = arr.el[j].el();
    if(parentEl == null) {
      $("#main")[0].append(currEl);
    }
    else {
      parentEl.append(currEl);
    }
    parentEl = currEl;
  }
}

function laneToLeft(laneNo) {
    return (hGap + (hDim + hGap) * laneNo);
}

let moveDnStack = function(lane) {
  laneLen = main[lane].el.length;
  for(let i = 0; i < laneLen; i++) {
    let m = $(main[lane].el[i].el());
    m.css("top", vGap * 2 + vDim + shft*i + "px").css("left", laneToLeft(lane) + "px").css("height", vDim - 2*border + "px");
    main[lane].el[i].vis ? elMove(m) : elFix(m);
    if(main[lane].el[i].vis) {
      m.css("height", vDim + shft * (laneLen - 1 - i) - 2*border + "px");
    }
    dropTarget(m);
  }
}

let moveUpStack = function(lane) {
  if(lane === 6) {
    for(let i = 0; i < stack[1].el.length; i++) {
      let m = $(stack[1].el[i].el());
      m.css("top", vGap + "px").css("left", laneToLeft(lane) + "px").css("height", vDim - 2*border + "px");
      nonDropTarget(m);
    }
  } else {
    for(let i = 0; i < discard[lane].el.length; i++) {
      let m = $(discard[lane].el[i].el());
      m.css("top", vGap + "px").css("left", laneToLeft(lane) + "px").css("height", vDim - 2*border +"px");
      dropTarget(m);
    }
  }
}

let drawOpen = function() {
  const stackLen = stack[0].el.length
  for(let i = 0; i < stackLen; i++) {
    let m = $(stack[0].el[i].el());
    m.css("top", vGap + "px");
    elFix(m);
    nonDropTarget(m);
    switch (i) {
      case stackLen - 2:
        $(m).css("left", Math.floor((laneToLeft(5) + laneToLeft(4))/2) + 'px');
        break;
      case stackLen - 1:
        $(m).css("left", laneToLeft(5) + 'px');
        elMove(m);
        break;
      default:
        $(m).css("left", laneToLeft(4) + 'px');
        break;
    }
  }
}

let drawField = function() {
  const deckCopy = [...deck];
  while (deckCopy.length > 0) {
    const card = deckCopy.pop();
    $("#main")[0].append(card.el());
  }
  for(let i = 0; i < 7; i++) {
    drawStack(main[i]);
    moveDnStack(i);
  }
  for(let i = 0; i < 4; i++) {
    drawStack(discard[i]);
    moveUpStack(i);
  }
  for(let i = 0; i < 2; i++) {
    drawStack(stack[i]);
    i === 0 ? drawOpen() : moveUpStack(i+5);
  }
  $("#main")[0].append($("#stackoverturn")[0]);
  assessLayout();
}

lastMove = function(from, to) {
  to.el.push(from.last());
  from.el.splice(from.el.length-1);
}

cardCanMoveToMain = function(card, to) {
  let doMove = false;
  if (to.el.length == 0 && card.no == 12) {
    doMove = true;
  } else {
    if (to.len() > 0) {
      if (to.last().no == card.no+1 && (card.color() != to.last().color())) {
        doMove = true;
      }
    }
  }
  return doMove;
}

canMoveToMain = function(from, to, howmany) {
  let doMove = false;
  if(from.el[from.el.length - howmany].vis) {
    doMove = cardCanMoveToMain(neededFrom(from, howmany)[0], to);
    //if (to.el.length == 0 && neededFrom(from, howmany)[0].no == 12) {
      //doMove = true;
    //} else {
      //if (to.len() > 0) {
        //if (to.last().no == neededFrom(from, howmany)[0].no+1 && (neededFrom(from, howmany)[0].color() != to.last().color())) {
          //doMove = true;
        //}
      //}
    //}
    //if(doMove) {
      //doTheMove(from, to, howmany);
    //}
  }
  return doMove;
}

moveToMain = function(from, to, howmany) {
  let doMove = canMoveToMain(from, to, howmany);
  //if(from.el[from.el.length - howmany].vis) {
    //if (to.el.length == 0 && neededFrom(from, howmany)[0].no == 12) {
      //doMove = true;
    //} else {
      //if (to.len() > 0) {
        //if (to.last().no == neededFrom(from, howmany)[0].no+1 && (neededFrom(from, howmany)[0].color() != to.last().color())) {
          //doMove = true;
        //}
      //}
    //}
    if(doMove) {
      doTheMove(from, to, howmany);
    }
  //}
  return doMove;
}

const neededFrom = function(from, howmany) { return [...from.el].slice(from.el.length - howmany); }

doTheMove = function (from, to, howmany) {
  to.el=to.el.concat(neededFrom(from, howmany));
  from.el.splice(from.el.length -howmany);
}

undoCmd = function() {
  const cmd = history.pop();
  if (cmd) {
    const parm = (cmd.split(" ")).map(m => parseInt(m)).slice(1);
    switch(cmd.substring(0,1)) {
      case "a":
        if (parm[0] === 0) {
          while(stack[1].el.length > 0) {
            stack[0].el.push(stack[1].el[0]);
            stack[1].el.splice(0,1);
          }
        } else {
          for(let i = 0; i < parm[0]; i++) {
            stack[1].el.unshift(stack[0].last());
            stack[0].el.pop();
          }
        }
        break;
      case "s": //from to how many  (sm) (m)
        if(parm.length === 4) {
          main[parm[0]].invisLast();
        }
        doTheMove(main[parm[1]], parm[0] === 7 ? stack[0]: main[parm[0]], parm[0] === 7 ? 1: parm[2]);
        break;
      case "r": //(sm) (d)
        if(parm.length === 3) {
          main[parm[0]].invisLast();
        }
        doTheMove(discard[parm[1]], parm[0] === 7 ? stack[0]: main[parm[0]], 1);
        break;
      case "u": //(d) (d)
        doTheMove(discard[parm[1]], discard[parm[0]], 1);
        break;
      case "b": //(d) (m)
        doTheMove(main[parm[1]], discard[parm[0]], 1);
        break;
    }
    drawField();
  }
}

redoCmd = function() {
  procCmd(history.next(), true);
  drawField();
}

procCmd = function(cmd, redo) {
  switch(cmd.substring(0,1)) {
    case "a":
      if(stack[1].el.length === 0) {
        if(stack[0].el.length > 3) {
          while(stack[0].el.length > 0) {
            stack[1].el.push(stack[0].el[0]);
            stack[0].el.splice(0,1);
          }
          history.push("a 0", redo);
        }
      } else {
        let turned = 0;
        for(let i = 0; i < 3; i++) {
          if (stack[1].el.length > 0) {
            stack[0].el.push(stack[1].el[0]);
            stack[1].el.splice(0,1);
            turned++;
          }
        }
        if (turned > 0) {
          history.push("a " + turned, redo);
        }
      }
      break;
    case "s": //from to how many  (sm) (m)
      const parm = (cmd.split(" ")).map(m => parseInt(m)).slice(1);
      //const doMove = moveToMain(parm[0] === 7 ? stack[0]: main[parm[0]], main[parm[1]], parm[0] === 7 ? 1: parm[2]);
      //if((parm[0] < 7) && doMove) {
      if (moveToMain(parm[0] === 7 ? stack[0]: main[parm[0]], main[parm[1]], parm[0] === 7 ? 1: parm[2])) {
        let visLast = false;
        if(parm[0] < 7) {
          visLast = main[parm[0]].visLast();
        }
        history.push(cmd + (parm.length < 4 ? (visLast ? " 1" : "") : ""), redo);
      }
      break;
    case "r": //(sm) (d)
      const fromPileNo = parseInt(cmd.split(" ")[1]);
      const toPileNo = parseInt(cmd.split(" ")[2]);
      let fromPile;
      if(fromPileNo < 7) {
        fromPile = main[fromPileNo];
      } else {
        fromPile = stack[0];
      }
      const fromLast = fromPile.last(); //getLast(arr);
      const toLast = discard[toPileNo].last();
      if(discard[toPileNo].el.length === 0 ? fromLast.no === 0 : (fromLast.no === toLast.no + 1) && (fromLast.suit === toLast.suit) ) {
        lastMove(fromPile, discard[toPileNo]);
        //if(fromPileNo > 0) {
        history.push(cmd + (fromPile.visLast() ? " 1" : ""), redo);
        //}
      }
      break;
    case "u": //(d) (d)
      const from = parseInt(cmd.split(" ")[1]);
      const to = parseInt(cmd.split(" ")[2]);
      if((from !== to) && (discard[from].last().no === 0) && (discard[to].el.length === 0)) {
        lastMove(discard[from], discard[to]);
        history.push(cmd, redo);
      }
      break;
    case "b": //(d) (m)
      const bparm1 = parseInt(cmd.split(" ")[1]);
      const bparm2 = parseInt(cmd.split(" ")[2]);
      if (moveToMain(discard[bparm1], main[bparm2], 1)) {
        history.push(cmd, redo);
      }
      break;
    default:
      console.log("command " + cmd + " is not supported");
  }
}

const addBtn = function(btnTop, left, width, capt, func) {
    let btn = document.createElement("button");
    $(btn).css("top", btnTop + "px").css("left", left + "px").css("width", width + "px")
      .html(capt).attr("onclick", func);
    $("#main")[0].append(btn);
}

const everyNthL = (arr, nth) => arr.filter((e, i, a) => (i % nth === nth - 1) || (i === a.length - 1))

const procEnd = (arr) => {
    if (arr[2].length < arr[1].length) {
        arr[2].push(arr[1].last());
        arr[1].splice(-1, 1, arr[0].last());
        arr[0].splice(-1, 1, " ");
    }
    if (arr[1].length < arr[0].length) {
        arr[2].push(arr[0].last());
        arr[1].push(" ");
        arr[0].splice(-1, 1, " ");
    }

}

const doesntHaveLeftBlankOnMain = (cardNo, currPos) => {
    if (cardNo === 0) {
        return false;
    }
    if (cardNo === 12) {
        for(let m = 0; m < currPos; m++) {
            if(main[m].el.length === 0) {
                return false;
            }
        }
    }
    return true;
}

const assessLayout = function() {
    //console.log("assess");
    //const stackfilter = [];
    //if (stack[0].el.length > 0) {
      //stackfilter.push(stack[0].last());
    //}
    //console.log([...new Set((stack[0].el.length > 0 ? [stack[0].last()] : []).concat(everyNthL(stack[1].el, 3))
        //.concat(everyNthL(stack[0].el.concat(stack[1].el), 3)))]);
    //const stackfilter = [...new Set((stack[0].el.length > 0 ? [stack[0].last()] : []).concat(everyNthL(stack[1].el, 3))
        //.concat(everyNthL(stack[0].el.concat(stack[1].el), 3)))];
    const stackfilter = [...new Set([].concat(everyNthL(stack[1].el, 3).concat([""]))
        .concat(everyNthL(stack[0].el.concat(stack[1].el), 3)))].filter((elem) => stack[0].el.length === 0 ? true :
        ((stack[0].last().no !== elem.no) || (stack[0].last().suit !== elem.suit)));
    const stackpreview = [[], [], []];
    stack[1].el.forEach((val, idx, arr) => {stackpreview[idx % 3].push(cardSpan(val));});
    /*if (stackpreview[2].length < stackpreview[1].length) {
        stackpreview[2].push(stackpreview[1][stackpreview[1].length - 1]);
        stackpreview[1][stackpreview[1].length - 1] = stackpreview[0][stackpreview[0].length - 1];
        stackpreview[0][stackpreview[0].length - 1] = " ";
    }
    if (stackpreview[1].length < stackpreview[0].length) {
        stackpreview[2].push(stackpreview[0][stackpreview[0].length - 1]);
        stackpreview[1].push(" ");
        stackpreview[0][stackpreview[0].length - 1] = " ";
    }*/
    procEnd(stackpreview);
    stackpreview[0].push("&nbsp");
    stackpreview[1].push("&nbsp");
    stackpreview[2].push("&nbsp");
    stack[0].el.concat(stack[1].el).forEach((val, idx, arr) => {stackpreview[idx % 3].push(cardSpan(val));});
    //console.log(stackpreview);
    procEnd(stackpreview);
    //stack[0].el.concat(stack[1].el).forEach((val, idx, arr) => {console.log(val);});
    //console.log(stackpreview);
    const mainarr = stackfilter.reduce((acc, curr) => {acc.push(""); return acc;}, []);
    const discarr = stackfilter.reduce((acc, curr) => {acc.push(""); return acc;}, []);
    let smove = "";
    let rmove = "";
    let bmove = "";
    const divider = " &nbsp;&nbsp; ";
    let sbackmove = "";
    $(".clickfru")[0].innerHTML =
        "<div style=\"position:absolute;bottom:0;\">" +
        "<table><tbody>" +
        //"<tr>" + stackfilter.reduce((acc, curr) => acc += "<td>" + cardSpan(curr) + "</td>", "") + "</tr>" +
        "<tr class=\"dull\">" + stackpreview[0].reduce((acc, curr) => acc += "<td>" + curr + "</td>", "") + "</tr>" +
        "<tr class=\"dull\">" + stackpreview[1].reduce((acc, curr) => acc += "<td>" + curr + "</td>", "") + "</tr>" +
        "<tr>" + stackpreview[2].reduce((acc, curr) => acc += "<td>" + curr + "</td>", "") + "</tr>" +
        "</tbody></table></div>"; // +
        //"</div><br /><br /><br /><br /><br /><br /><br />";
    for(let i = 0; i < 7; i++) {
        const fromLast = main[i].last(); //getLast(arr);
        for(let j = 0; j < 7; j++) {
            if(i != j) {
                let firstvis = true;
                for(let k = 0; k < main[j].el.length; k++) {
                    if(main[j].el[k].vis) {
                        if(canMoveToMain(main[j], main[i], main[j].el.length - k)) { //from to howmany
                            //$(".clickfru")[0].innerHTML += (firstvis ? "" : "*") + "s " + j + " " + i + " " + (main[j].el.length - k) + "<br />";
                            //if(((main[j].el[k] === 12)&&((main[j].el.length - k) === 0))) {
                                //console.log("king on " + j + "and is on top");
                            //}
                            if(!((main[j].el[k].no === 12)&&(k === 0))) {
                                if(firstvis) {
                                    if(doesntHaveLeftBlankOnMain(main[j].el[k].no, i)) {
                                        smove += "s " + j + " " + i + " " + (main[j].el.length - k) + divider; //<br />";
                                    }
                                } else {
                                    sbackmove += "*s " + j + " " + i + " " + (main[j].el.length - k) + divider; //<br />";
                                }
                            }
                            //console.log("s " + j + " " + i + " " + (main[j].el.length - k));
                        }
                        firstvis = false;
                    }
                }
            }
        }
        if(stack[0].el.length > 0) {
            if(canMoveToMain(stack[0], main[i], 1)) {
                //$(".clickfru")[0].innerHTML += "s 7 " + i + "<br />";
                if(doesntHaveLeftBlankOnMain(stack[0].last().no, i)) {
                    smove += "s 7 " + i + divider; //<br />";
                }
                //console.log("s 7 " + i);
            }
        }
        for(let j = 0; j < stackfilter.length; j++) {
            if(stackfilter[j] !== "") {
                if(cardCanMoveToMain(stackfilter[j], main[i], 1)) {
                    //$(".clickfru")[0].innerHTML += "" + j + " s 7 " + i + "<br />";
                    if(doesntHaveLeftBlankOnMain(stackfilter[j].no, i)) {
                        mainarr[j] += "" + j + " s 7 " + i + divider; //<br />";
                    }
                }
            }
        }
        for(let j = 0; j < 4; j++) {
            if(discard[j].el.length > 0) {
                if(canMoveToMain(discard[j], main[i], 1)) {
                    //$(".clickfru")[0].innerHTML += "b " + j + " " + i + "<br />";
                    bmove += "b " + j + " " + i + divider; //<br />";
                    //console.log("b " + j + " " + i);
                }
            }
            if(main[i].last()) {
                const toLast = discard[j].last();
                if((discard[j].el.length !== 0) && (fromLast.no === toLast.no + 1) && (fromLast.suit === toLast.suit) ) {
                    //$(".clickfru")[0].innerHTML += "r " + i + " " + j + "<br />";
                    rmove += "r " + i + " " + j + divider; //<br />";
                    //console.log("r " + i + " " + j);
                }
            }
        }
        if(fromLast && fromLast.no === 0) {
            //$(".clickfru")[0].innerHTML += "r " + i + "<br />";
            rmove += "r " + i + divider; //<br />";
        }
    }
    if(stack[0].el.length > 0) {
        const fromLast = stack[0].last(); //getLast(arr);
        for(j = 0; j < 4; j++) {
            const toLast = discard[j].last();
            if((discard[j].el.length !== 0) && (fromLast.no === toLast.no + 1) && (fromLast.suit === toLast.suit) ) {
                //$(".clickfru")[0].innerHTML += "r 7 " + j + "<br />";
                rmove += "r 7 " + j + divider; //<br />";
                //console.log("r 7 " + j);
            }
        }
        if(fromLast && fromLast.no === 0) {
            //$(".clickfru")[0].innerHTML += "r 7<br />";
            rmove += "r 7" + divider; // <br />";
        }
    }
    for(let k = 0; k < stackfilter.length; k++) {
        //if(canMoveToMain(stackfilter[j], main[i], 1)) {
            //$(".clickfru")[0].innerHTML += "" + j + " s 7 " + i + "<br />";
        //}
        if(stackfilter[k] !== "" ) {
            for(let j = 0; j < 4; j++) {
                const toLast = discard[j].last();
                if((discard[j].el.length !== 0) && (stackfilter[k].no === toLast.no + 1) && (stackfilter[k].suit === toLast.suit) ) {
                    //$(".clickfru")[0].innerHTML += "" + k + " r 7 " + j + "<br />";
                    discarr[k] += "" + k + " r 7 " + j + divider; // + "<br />";
                    //console.log("r 7 " + j);
                }
            }
            if(stackfilter[k].no === 0) {
                //$(".clickfru")[0].innerHTML += "" + k + " r 7<br />";
                discarr[k] += "" + k + " r 7" + divider; //<br />";
            }
        }
    }
    $(".clickfru")[0].innerHTML += "<div style=\"position:absolute;bottom:0;\">" +
      smove + rmove + mainarr.reduce((acc, el, idx) => acc += el + discarr[idx], "") +
      //discarr.reduce((acc, el) => acc + el, "") +
      sbackmove + bmove + "<br /><br /><br /><br /></div>";
    //mainarr
    //discarr
    //smove
    //rmove
    //bmove
    //sbackmove
    //stack[0]
    //sm m
    //sm d
    //b: d m
}

window.addEventListener('load', function() {
    dropTarget($("#main")[0]);
    $("#main")[0].append(nonCardString("spades", vGap, hGap + (hGap + hDim) * 0, 0));
    $("#main")[0].append(nonCardString("hearts", vGap, hGap + (hGap + hDim) * 1, 1));
    $("#main")[0].append(nonCardString("diams", vGap, hGap + (hGap + hDim) * 2, 2));
    $("#main")[0].append(nonCardString("clubs", vGap, hGap + (hGap + hDim) * 3, 3));
    $("#main")[0].append(nonCardString("", vGap, hGap + (hGap + hDim) * 6));
    for(let suits = 0; suits < 4; suits++) {
      for(let nos = 0; nos < 13; nos++) {
        $("#main")[0].append(cardString(new Card(suits, nos, false)));
      }
    }
    replay(false);
    /* test */
    /*stack[0].el = [];
    stack[1].el = [];
    for(let i = 0; i < 7; i++) {
      main[i].el = [];
    }
    for(let i = 12; i > -1; i--) {
      //main[1].el = [];
      main[0].el.push(new Card(0, i, 1));
      main[1].el.push(new Card(2, i, 1));
      if(i > 5) {
        main[2].el.push(new Card(3, i, 1));
      } else {
        main[6].el.push(new Card(3, i, 1));
      }
      main[6].el.push(new Card(1, i, 1));
    }
    drawField();
    */
    /* test end */
    const btnTop = vGap * 2 + vDim * 2 + shft * 17;
    $("#container").css("width", hDim * 7 + hGap * 8 + "px").css("height", btnTop + "px");
    //let btn = document.createElement("button");
    //$(btn).css("top", btnTop + "px").css("left", hGap +'px').css("width", hDim*2 +hGap +"px")
      //.html("start over").attr("onclick", "replay(true);");
    //$("#main")[0].append(btn);
    addBtn(btnTop, hGap, hDim * 2 + hGap, "start over", "replay(true);");
    //addBtn(btnTop, hGap, hDim * 2 + hGap, "" + (btnTop + shft) /* + "start over" */, "replay(true);");
    //addBtn(btnTop, hGap, hDim * 2 + hGap, "" + (document.documentElement.clientHeight) /* + "start over" */, "replay(true);");
    //addBtn(btnTop, hGap, hDim * 2 + hGap, "" + hDim /* + "start over" */, "replay(true);");
    //btn = document.createElement("button");
    //$(btn).css("top", btnTop + "px").css("left", hDim*2 + 2*border + hGap*2 + "px").css("width", hDim + "px")
      //.html("new").attr("onclick", "replay(false);");
    //$("#main")[0].append(btn);
    addBtn(btnTop, (hGap+hDim)*2 + border*2, hDim, "new", "replay(false);");
    addBtn(btnTop, (hGap+hDim)*3 + border*2, hDim, "undo", "undoCmd();");
    addBtn(btnTop, (hGap+hDim)*4 + border*2, hDim, "redo", "redoCmd();");
    const onConfirmRefresh = function (event) {
        event.preventDefault();
        return event.returnValue = "Are you sure you want to leave the page?";
    }
    window.addEventListener("beforeunload", onConfirmRefresh, { capture: true });
});
