function isIn(thing, list) {
  for (var i = 0; i < list.length; i++) if (list[i] === thing) return true;
  return false;
}

var SPLIT = false;
var LOST = false;
var WON = false;
var DRAW = false;
var GAME_OVER = false;
var MONEY = 0;
var BET = 1;
var GAME_IS_ACTIVE = false;
if (getCookie("money") == "") {
  setCookie("money", 20, 365);
  MONEY = parseInt(getCookie("money"));
} else {
  MONEY = parseInt(getCookie("money"));
}

var DICT = {
  A: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  J: [],
  Q: [],
  K: [],
};

function dealACard() {
  var letters = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  while (true) {
    var randomNumber = parseInt(Math.random() * 13);
    var letter = letters[randomNumber];
    var shape = ["heart", "diamond", "club", "spade"][
      parseInt(Math.random() * 4)
    ];

    if (isIn(shape, DICT[letter]) === false) {
      DICT[letter].push(shape);
      return [letter, shape, randomNumber + 1];
    }
  }
}

function draw(letter, shape, who) {
  let className = "";
  if (who) {
    //dealer
    className = ".handDealer";
  } else {
    //you
    className = ".handYou";
  }

  let beat = "'";
  if (shape === "heart") {
    beat = " fa-beat";
  }
  $(className).append(
    "<div class='card " +
      shape +
      "'><div class='letter'>" +
      letter +
      "</div><br><div class='shape'><i class='fad fa-" +
      shape +
      beat +
      " '></i></div></div>"
  );
}

var DEALERS_HAND = [];
var YOUR_HAND = [];

function sum(array) {
  let res = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i] > 10) res += 10;
    else if (array[i] === 1) res += 11;
    else res += array[i];
  }
  if (isIn(1, array) && res > 21) res += -11 + 1;
  return res;
}

function validate(who) {
  let som;
  let className = "";
  if (who) {
    className = ".dealersSom";
    som = sum(DEALERS_HAND);
  } else {
    className = ".yourSom";
    som = sum(YOUR_HAND);
  }
  $(className).html("<h1>" + som + "</h1>");

  if (som < 21) {
    //DISABLE DEAL
    $(".dealED").each(function () {
      this.style.pointerEvents = "none";
    });
    return som;
  }

  if (som > 21) {
    //DISABLE HIT AND STAND
    $(".hitNStand").each(function () {
      this.style.pointerEvents = "none";
    });
    // ENABLE DEAL
    $(".dealED").each(function () {
      this.style.pointerEvents = "auto";
    });
    return som;
  }

  if (som === 21) {
    // console.log("WIN");
    //DISABLE HIT AND STAND
    $(".hitNStand").each(function () {
      this.style.pointerEvents = "none";
    });
    // ENABLE DEAL
    $(".dealED").each(function () {
      this.style.pointerEvents = "auto";
    });
    return som;
  }
}

function reset() {
  changeBet(BET);
  showMoney();
  DICT = {
    A: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
    10: [],
    J: [],
    Q: [],
    K: [],
  };
  DEALERS_HAND = [];
  YOUR_HAND = [];
  $(".handDealer").empty();
  $(".handYou").empty();

  //ENABLE DEAL
  $(".dealED").each(function () {
    this.style.pointerEvents = "auto";
  });
  //DISABLE HIT AND STAND
  $(".hitNStand").each(function () {
    this.style.pointerEvents = "none";
  });
  $(".winner").html("<h1>Blackjack</h1>");
}

function hit(who) {
  if (!GAME_OVER) {
    if (who) {
      let [letter, shape, number] = dealACard();
      DEALERS_HAND.push(number);
      draw(letter, shape, who);
      validate(who);
    } else {
      let [letter, shape, number] = dealACard();
      YOUR_HAND.push(number);
      draw(letter, shape, who);
      var vl = validate(who);
      if (vl > 21) {
        console.log("BEFORE STAND");
        clearTimeout();
        var animationDuration = 500;
        setTimeout(function () {
          stand();
        }, animationDuration);
      } else if (vl === 21) {
        stand();
      }
    }
  }
}

function stand() {
  $(".hitNStand").each(function () {
    this.style.pointerEvents = "none";
  });

  var som = validate(0); //YOU
  while (1) {
    var dealersSom = validate(1);
    if (som > 21) {
      if (dealersSom >= 17) {
        LOST = true;
        break;
      } else {
        hit(1);
        LOST = true;
      }
    } else if (som < dealersSom && dealersSom <= 21 && dealersSom >= 17) {
      //DEALERS IS A WINNER NO HIT
      LOST = true;
      break;
    } else if (dealersSom > 21 || som === 21) {
      //YOU WIN !
      WON = true;
      console.log(YOUR_HAND);
      if (
        (YOUR_HAND[0] == 1 && YOUR_HAND[1] == 10) ||
        (YOUR_HAND[1] == 1 && YOUR_HAND[0] == 10)
      ) {
        // blackjack
        MONEY += parseInt(Math.ceil(BET / 2));
      }
      break;
    } else if (som >= dealersSom) {
      //THINK WHAT TO DO
      if (dealersSom >= 17) {
        if (som === dealersSom) {
          DRAW = true;
          break;
        } else {
          // YOU WIN!
          WON = true;
          break;
        }
      } else {
        //ONE HIT TO REACH 17
        hit(1);
      }
    } else {
      hit(1);
      console.log(
        "WHAT HAPPENED!!! You may pressed buttons so quickly. -_-  CHILL OUT and refresh the page."
      );
    }
  }
  //ENABLE DEAL
  $(".dealED").each(function () {
    this.style.pointerEvents = "auto";
  });

  if (LOST) {
    MONEY -= parseInt(BET);
    $(".winner").html("<h1>DEALER WON !</h1>");
  } else if (WON) {
    MONEY += parseInt(BET);
    console.log("YOU WIN!");
    $(".winner").html("<h1>YOU WON !</h1>");
  } else if (DRAW) {
    $(".winner").html("<h1>DRAW</h1>");
  }
  GAME_IS_ACTIVE = false;
  LOST = false;
  WON = false;
  DRAW = false;
  changeBet(BET);
  showMoney();
  checkGameOver();
}

function dealAgain() {
  GAME_IS_ACTIVE = true;
  if (!GAME_OVER) {
    reset();
    $(".hitNStand").each(function () {
      this.style.pointerEvents = "auto";
    });

    setTimeout(function () {
      hit(1);
    }, animationDuration + 300 + 300);

    var animationDuration = 300;

    setTimeout(function () {
      hit(0);
    }, animationDuration);

    setTimeout(function () {
      hit(0);
    }, animationDuration + 300);

    clearTimeout();

    validate(0);
  }
}

// function split() {//! not yet
//   SPLIT = true;
//   if (YOUR_HAND[0] == YOUR_HAND[1]) {
//     var theDoubleCard = YOUR_HAND[0];
//     YOUR_HAND.pop();
//     anotherYOUR_HAND.push(theDoubleCard);
//     $(".handYou").empty();
//     setTimeout(function () {
//       hit(0);
//     }, 300);
//   }
// }

reset();
$(".hit").click(function () {
  $(this).toggleClass("flip");
});

function showMoney() {
  document.getElementById("money").innerText = MONEY;
  setCookie("money", MONEY, 365);
}

// * if you want to just test it on your own computer without running server:
// * comment these two functions ("setCookie" and "getCookie") and use the little ones after them

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
// function setCookie(cname, cvalue, exdays) {
//   MONEY = cvalue;
// }
// function getCookie(cname) {
//   return MONEY;
// }

function help(close = 0) {
  let helpNote = document.getElementById("help");
  if (!close) {
    helpNote.classList.remove("hide");
  } else {
    helpNote.classList.add("hide");
  }
}

function changeBet(amount = 0) {
  if (!GAME_IS_ACTIVE) {
    if (amount <= MONEY && amount > 0) {
      document
        .getElementById(BET.toString())
        .children[0].classList.remove("activeCoin");
      BET = amount;
      console.log(document.getElementById(BET.toString()));
      document
        .getElementById(BET.toString())
        .children[0].classList.add("activeCoin");
    } else {
      document
        .getElementById(BET.toString())
        .children[0].classList.remove("activeCoin");
      document.getElementById("1").children[0].classList.add("activeCoin");
      BET = 1;
    }
  }
}

function checkGameOver() {
  if (MONEY <= 0) {
    GAME_OVER = true;
    $(".winner").html("<h1>Game Over!</h1>");
    document.getElementById("restart").classList.remove("hide");
  }
}

function restartGame() {
  MONEY = 20;
  GAME_OVER = false;
  reset();
  document.getElementById("restart").classList.add("hide");
}
