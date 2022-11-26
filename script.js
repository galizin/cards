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
    this.el = [];
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
      this.last().vis = true;
    }
  }
  idx(id) {
    return this.el.map(m => m.id()).indexOf(id);
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
      if (j == i)
        stack[1].el[0].vis = true;
     main[j].el.push(stack[1].el[0]);
     stack[1].el.splice(0, 1);
   }
  }

  stack[1].el.forEach(m => m.vis = true);
  drawField();
}

var shft = 25;
var hDim = 59;
var vDim = 73;
var vGap = 4;
var hGap = 4;
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
    let red = card.color() === "red"; //suit == 1 || suit == 2 ? 1 : 0;
    let suitname = ["&spades;","&hearts;","&diams;","&clubs;"][card.suit];
    let cardname = ['A','2','3','4','5','6','7','8','9','10', 'J', 'Q', 'K'][card.no];
    let el = document.createElement("span");
    $(el).attr("class", "outerspan").attr("id", card.id()).css("height", vDim - border*2 + "px").css("width", hDim - border*2 + "px");
    $(el).html((red ? '<mark class="red">' : '') + '<span class="innerspan">' + suitname + cardname + '</span>' + (red ? '</mark>' : ''));
    return el;
};

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

function searchMain(id) {
    for(let i = 0; i < 7; i++) {
      const idx = main[i].idx(id);
      if (idx !== -1) {
        return [i, main[i].len() - idx];
      }
    }
    return [-1, 0];
}

function move2cmd(from, hlane, vlane) {
  function isSM(a) {
    if(stack[0].last() && stack[0].last().id() === a) {
      return [7, 1];
    }
    const inMain = searchMain(a);
    if(inMain[0] !== - 1) {
      return inMain;
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
        $(m).css("left", hGap + (hDim + hGap) * 5 -1*hGap*8 + 'px');
        break;
      case stackLen - 1:
        $(m).css("left", laneToLeft(5) + 'px');
        elMove(m);
        break;
      default:
        $(m).css("left", laneToLeft(5) -2*hGap*8 + 'px');
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
}

lastMove = function(from, to) {
  to.el.push(from.last());
  from.el.splice(from.el.length-1);
}

moveToMain = function(from, to, howmany) {
  let doMove = false;
  if(from.el[from.el.length - howmany].vis) {
    const neededFrom = [...from.el].slice(from.el.length - howmany);
    if (to.el.length == 0 && neededFrom[0].no == 12) {
      doMove = true;
    } else {
      if (to.len() > 0) {
        if (to.last().no == neededFrom[0].no+1 && (neededFrom[0].color() != to.last().color())) {
          doMove = true;
        }
      }
    }
    if(doMove) {
      from.el.splice(from.el.length -howmany);
      to.el=to.el.concat(neededFrom);
    }
  }
  return doMove;
}

procCmd = function(cmd) {
  switch(cmd.substring(0,1)) {
    case "a":
      if(stack[1].el.length === 0) {
        while(stack[0].el.length > 0) {
          stack[1].el.push(stack[0].el[0]);
          stack[0].el.splice(0,1);
        }
      } else {
        for(let i = 0; i < 3; i++) {
          if (stack[1].el.length > 0) {
            stack[0].el.push(stack[1].el[0]);
            stack[1].el.splice(0,1);
          }
        }
      }
      break;
    case "s": //from to how many  (sm) (m)
      const parm = (cmd.split(" ")).map(m => parseInt(m)).slice(1);
      const doMove = moveToMain(parm[0] === 7 ? stack[0]: main[parm[0]], main[parm[1]], parm[0] === 7 ? 1: parm[2]);
      if((parm[0] < 7) && doMove) {
        main[parm[0]].visLast();
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
        if(fromPileNo > 0) {
          fromPile.visLast();
        }
      }
      break;
    case "u": //(d) (d)
      const from = parseInt(cmd.split(" ")[1]);
      const to = parseInt(cmd.split(" ")[2]);
      if((from !== to) && (discard[from].last().no === 0) && (discard[to].el.length === 0)) {
        lastMove(discard[from], discard[to]);
      }
      break;
    case "b": //(d) (m)
      const bparm1 = parseInt(cmd.split(" ")[1]);
      const bparm2 = parseInt(cmd.split(" ")[2]);
      moveToMain(discard[bparm1], main[bparm2], 1);
      break;
    default:
      console.log("command " + cmd + " is not supported");
  }
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
    let btn = document.createElement("button");
    const btnTop = vGap * 3 + vDim * 2 + shft * 18;
    $("#main").css("width", hDim * 7 + hGap * 8 + "px").css("height", btnTop + "px");
    $(btn).css("top", btnTop + "px").css("left", hGap +'px').html("start over").css("width", hDim*2 +hGap +"px")
      .attr("onclick", "replay(true);");
    $("#main")[0].append(btn);
    btn = document.createElement("button");
    $(btn).css("top", btnTop + "px").css("left", hDim*2 + 2*border + hGap*2 + "px").css("width", hDim + "px")
      .html("new").attr("onclick", "replay(false);");
    $("#main")[0].append(btn);
    const onConfirmRefresh = function (event) {
        event.preventDefault();
        return event.returnValue = "Are you sure you want to leave the page?";
    }
    window.addEventListener("beforeunload", onConfirmRefresh, { capture: true });
});
