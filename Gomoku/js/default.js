/** chess变量为html文件中<canvas>元素的引用 */
var chess = document.getElementById("chess");

/** 获取该chess画布元素的context */
var context = chess.getContext("2d");
context.strokeStyle = "#3a3a3a"; //默认划线颜色为黑色

/** 棋盘背景图片 */
var img = new Image();
img.src = "img/wood.jpg";

/** 赢法三维数组及其初始化 */
var wins = [];
for (var i = 0; i < 15; i++) {
    wins[i] = [];
    for (var j = 0; j < 15; j++) {
        wins[i][j] = [];
    }
}

/** 赢法统计变量 */
var count = 0; //一共有572种赢法

/** 横向赢法统计 */
for (var i = 0; i < 15; i++) { //横坐标
    for (var j = 0; j < 11; j++) { //纵坐标，首子落在前十个位置，以防超出棋盘
        for (var k = 0; k < 5; k++) { //五子中的每一个
            /* i为横坐标，j为纵坐标，k为五子序号，横向赢法k加到纵坐标中 */
            wins[i][j + k][count] = true; //true表示此处有子

        }
        count++; //解法数量增加
    }
}

/** 纵向赢法统计 */
for (var i = 0; i < 11; i++) { //横坐标，首子落在前十个位置，以防超出棋盘
    for (var j = 0; j < 15; j++) {
        for (var k = 0; k < 5; k++) {
            /* 纵向赢法，k加到横坐标中 */
            wins[i + k][j][count] = true;

        }
        count++;
    }
}

/** 正斜线赢法统计 */
for (var i = 0; i < 11; i++) { //横坐标，首子落在前十个位置，以防超出棋盘
    for (var j = 0; j < 11; j++) { //纵坐标，首子落在前十个位置，以防超出棋盘
        for (var k = 0; k < 5; k++) {
            /* 正斜线赢法，k分别加到横纵坐标中 */
            wins[i + k][j + k][count] = true;

        }
        count++;
    }
}

/** 反斜线赢法统计 */
for (var i = 0; i < 11; i++) { //横坐标，首子落在前十个位置，以防超出棋盘
    for (var j = 14; j > 3; j--) { //纵坐标，由于是反斜线，纵坐标遍历需与横坐标相反，首子落在后十个位置，以防超出棋盘
        for (var k = 0; k < 5; k++) {
            /* 反斜线赢法，k加到和坐标中，k与纵坐标做差*/
            wins[i + k][j - k][count] = true;

        }
        count++;
    }
}

/** 该变量记录游戏模式 */
var mode = "pvp"; //默认为玩家对战玩家

/* 该变量记录游戏是否结束 */
var over = false;

/** 一维数组，记录黑白两字在每种赢法中已有的棋子个数 */
var blackWin = [];
var whiteWin = [];
for (var i = 0; i < count; i++) {
    blackWin[i] = 0;
    whiteWin[i] = 0;
}

/** 加载棋盘 */
img.onload = function() {
    context.drawImage(img, 0, 0, 450, 450);
    drawLine(); //先在画布上绘制图片，后绘制格线，以防止格线被图片遮盖
}

/* color判断棋子类型，黑子为true，白子为false */
var color = true;

/* 二维数组，记录棋盘中各棋子位置 */
var chessBoard = [];
for (var i = 0; i < 15; i++) {
    chessBoard[i] = [];
    for (var j = 0; j < 15; j++) {
        chessBoard[i][j] = 0;
    }
}

/* 三维数组，记录棋盘的每一步 */
var steps = [];
for (var i = 0; i < 113; i++) {
    steps[i] = [];
    for (var j = 0; j < 15; j++) {
        steps[i][j] = [];
        for (var k = 0; k < 15; k++) {
            steps[i][j][k] = 0;
        }
    }
}

/**该变量记录步数 */
var step = 0;

/**该变量记录步数位置 */
var position = 0;

/**该变量统计是否能够悔棋 */
var backable = true;

/**
 * 重新开始，清空画布，重新绘制图像和线条，清空统计数组和棋盘数组。
 */
var restart = function() {

    document.getElementById("win").innerHTML = ""; //清空提示区

    /* 所有参数变为默认 */
    color = true;
    over = false;
    backable = true;

    for (var i = 0; i < 15; i++) {
        chessBoard[i] = [];
        for (var j = 0; j < 15; j++) {
            chessBoard[i][j] = 0;
        }
    }

    for (var i = 0; i < count; i++) {
        blackWin[i] = 0;
        whiteWin[i] = 0;
    }


    context.fillStyle = "#ffffff";
    context.beginPath();
    context.fillRect(0, 0, 450, 450);
    context.closePath();
    //先用白色覆盖整个棋盘
    context.drawImage(img, 0, 0, 450, 450); //画图
    drawLine(); //划线
}

/**
 * 将第step步画在棋盘上
 * @param {number} index 
 */
var drawStep = function(index) {
    restart(); //先重置棋盘
    for (var i = 0; i < 15; i++)
        for (var j = 0; j < 15; j++) { //遍历每一个位置
            switch (steps[index][i][j]) { //判定该位置是什么子
                case (1): //黑子
                    oneStep(i, j, true); //将这个子画到棋盘上
                    chessBoard[i][j] = 1; //记录到棋盘数组中
                    for (var k = 0; k < count; k++) { //赢法遍历
                        if (wins[i][j][k]) { //统计赢法
                            blackWin[k]++;
                            whiteWin[k] = 6;
                        }
                    }
                    break;
                case (2): //白子
                    oneStep(i, j, false);
                    chessBoard[i][j] = 2;
                    for (var k = 0; k < count; k++) {
                        if (wins[i][j][k]) {
                            blackWin[k] = 6;
                            whiteWin[k]++;
                        }
                    }
                    break;
                case (0): //无子
                    break;
            }
        }
}

/** 重置步数变量 */
var initialSteps = function() {
    step = 0;
    for (var i = 0; i < 113; i++) {
        steps[i] = [];
        for (var j = 0; j < 15; j++) {
            steps[i][j] = [];
            for (var k = 0; k < 15; k++) {
                steps[i][j][k] = 0;
            }
        }
    }
}

document.getElementById("restart").onclick = function(e) {
    restart(); //重置画布
    initialSteps();
    window.alert("游戏已重新开始！");
}

/** 当鼠标点击“玩家对战”按钮时，切换模式至“玩家对战”，并重置画布。 */
document.getElementById("pvp").onclick = function(e) {
    mode = "pvp"; //切换模式至pvp
    document.getElementById("text2").innerHTML = "玩家对战"; //显示pvp
    restart(); //重置画布
    initialSteps(); //重置步数
    window.alert("已切换至玩家对战！");
}

/** 当鼠标点击“人机对战”按钮时，切换模式至“人机对战”，并重置画布。 */
document.getElementById("pvc").onclick = function(e) {
    mode = "pvc";
    document.getElementById("text2").innerHTML = "人机对战";
    restart();
    initialSteps();
    window.alert("已切换至人机对战！");
}

/** 当鼠标点击“AI互殴”按钮时，切换模式至“AI互殴”，并重置画布。 */
document.getElementById("cvc").onclick = function(e) {
    mode = "cvc";
    document.getElementById("text2").innerHTML = "AI互殴";
    restart();
    initialSteps();
    window.alert("已切换至AI互殴！");
    document.getElementById("win").innerHTML = "单击棋盘走下一步";
}

/** 当鼠标点击“悔棋”按钮时，进行悔棋*/
document.getElementById("back").onclick = function(e) {

    if (backable) { //判断能否悔棋
        if (position >= 0) { //判断此时是否有子
            for (var i = 0; i < 15; i++) { //遍历棋盘
                for (var j = 0; j < 15; j++)
                    steps[position][i][j] = 0; //将当前的位置删除
            }
            position = position - 1; //位置递减
            drawStep(position); //画上一步的棋盘
            step = position; //step为位置
        } else {
            window.alert("无法继续悔棋！"); //如果此时棋盘无子，弹窗提示无法悔棋
        }
    } else if (!over) {
        window.alert("请等待白子出棋后悔棋！"); //如果黑子出棋，白子还没有，提示白子出完后再悔棋
    } else {
        window.alert("胜负已分，请重新开始！"); //如果游戏已经结束了，无法悔棋
    }


}



/**
 *  绘制15*15棋盘格线，格子大小为30px，格线与棋盘距离15px
 */
function drawLine() {
    for (var i = 0; i < 15; i++) {
        /* 水平线 */
        context.moveTo(15, 15 + i * 30);
        context.lineTo(435, 15 + i * 30); // 435 = 15 * 30 - 15
        context.stroke();
        /* 竖直线 */
        context.moveTo(15 + i * 30, 15);
        context.lineTo(15 + i * 30, 435);
        context.stroke();
    }

}

/**
 * 落子函数，将棋子绘制在棋盘中相应的位置
 * 
 * @param {number} i 棋子在棋盘中的x轴定位
 * @param {number} j 棋子在棋盘中的y轴定位
 * @param {boolean} color 棋子的类型，true为黑子，false为白子
 */
var oneStep = function(i, j, color) {

    context.beginPath();
    context.arc(15 + i * 30, 15 + j * 30, 13, 0, 2 * Math.PI); //设置圆的圆心横坐标、圆心纵坐标、半径、起始弧度、结束弧度
    context.closePath();

    /* 设置亮度渐变，参数分别为第一个圆心横纵坐标及半径、第二个圆心横纵坐标及半径 */
    var gradient = context.createRadialGradient(15 + i * 30 + 2, 15 + j * 30 - 2, 15, 15 + i * 30, 15 + j * 30, 0);

    if (color) {
        /* 设置黑子两个圆形渐变的颜色 */
        gradient.addColorStop(0, "#0a0a0a");
        gradient.addColorStop(1, "#636766");
        steps[step][i][j] = 1; //该位置有子，统计到步数记录数组中
    } else {
        /* 设置白子两个圆形渐变的颜色 */
        gradient.addColorStop(0, "#D1D1D1");
        gradient.addColorStop(1, "#F9F9F9");
        steps[step][i][j] = 2;
    }

    context.fillStyle = gradient; //填充样式设置为已配置好的渐变
    context.fill(); //将渐变填充至棋子内部

    /*context.font = "30px Arial";
    context.strokeText(step + 1, 15 + i * 30 - 8, 15 + j * 30 + 8);*/


}

var computerAI = function() {
    var blackScore = []; //一维数组，进行打分
    var whiteScore = [];
    var max = 0; //最高分
    var u = 0, //最终落子位置
        v = 0;
    for (var i = 0; i < 15; i++) { //初始化
        blackScore[i] = [];
        whiteScore[i] = [];
        for (var j = 0; j < 15; j++) {
            blackScore[i][j] = 0;
            whiteScore[i][j] = 0;
        }
    }
    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) { //遍历每一个位置
            if (chessBoard[i][j] == 0) {
                for (var k = 0; k < count; k++) {
                    if (wins[i][j][k]) { //如果该子在第k种赢法内
                        if (blackWin[k] == 1) { //黑子有一个子
                            blackScore[i][j] += 200; //分数加200
                            //debugger;
                        } else if (blackWin[k] == 2) {
                            blackScore[i][j] += 400;
                        } else if (blackWin[k] == 3) {
                            blackScore[i][j] += 2000;
                        } else if (blackWin[k] == 4) {
                            blackScore[i][j] += 10000;
                        }

                        if (whiteWin[k] == 1) { //白子有一个子
                            whiteScore[i][j] += 220; //白子分数比黑子略高
                        } else if (whiteWin[k] == 2) {
                            whiteScore[i][j] += 420;
                        } else if (whiteWin[k] == 3) {
                            whiteScore[i][j] += 2100;
                        } else if (whiteWin[k] == 4) {
                            whiteScore[i][j] += 20000;
                        }

                    }
                }
                if (blackScore[i][j] > max) { //白子围堵黑子，下在黑子分最高的位置上
                    max = blackScore[i][j];
                    u = i;
                    v = j;
                } else if (blackScore[i][j] == max) {
                    if (whiteScore[i][j] > whiteScore[u][v]) {
                        //如果该位置已经是最大了，判定白子该点的分数大还是黑子最高分位置白子的分数大
                        u = i;
                        v = j;
                    }
                }

                if (whiteScore[i][j] > max) { //同理，判断白子分数
                    max = whiteScore[i][j];
                    u = i;
                    v = j;
                } else if (whiteScore[i][j] == max) {
                    if (blackScore[i][j] > blackScore[u][v]) {
                        u = i;
                        v = j;
                    }
                }
            }
        }
    }
    oneStep(u, v, false); //下棋，位置为u,v
    chessBoard[u][v] = 2; //记录到统计数组中

    for (var k = 0; k < count; k++) { //判定白子是否赢，k为各赢法，count为赢法总数
        if (wins[u][v][k]) { //第k种赢法中，该位置为true
            whiteWin[k]++; //第k种赢法棋子数量++
            blackWin[k] = 6; ////在此设置成6，黑子将无法赢
            if (whiteWin[k] == 5) { //第k种赢法有5子，判定为赢
                document.getElementById("win").innerHTML = "电脑赢";
                backable = false;
                over = true;
            }
        }
    }
    if (!over) {
        color = !color;
    }
}

/**
 * AI互殴函数，具体算法与computerAI函数类似
 */
var aiBattle = function() {

    //与computerAI函数类似
    var blackScore = [];
    var whiteScore = [];
    var max = 0;
    var u = 0,
        v = 0;

    for (var i = 0; i < 15; i++) {
        blackScore[i] = [];
        whiteScore[i] = [];
        for (var j = 0; j < 15; j++) {
            blackScore[i][j] = 0;
            whiteScore[i][j] = 0;
        }
    }
    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
            if (chessBoard[i][j] == 0) {
                for (var k = 0; k < count; k++) {
                    if (wins[i][j][k]) {
                        if (blackWin[k] == 1) {
                            blackScore[i][j] += 200;
                            //debugger;
                        } else if (blackWin[k] == 2) {
                            blackScore[i][j] += 400;
                        } else if (blackWin[k] == 3) {
                            blackScore[i][j] += 2000;
                        } else if (blackWin[k] == 4) {
                            blackScore[i][j] += 10000;
                        }

                        if (whiteWin[k] == 1) {
                            whiteScore[i][j] += 220;
                        } else if (whiteWin[k] == 2) {
                            whiteScore[i][j] += 420;
                        } else if (whiteWin[k] == 3) {
                            whiteScore[i][j] += 2100;
                        } else if (whiteWin[k] == 4) {
                            whiteScore[i][j] += 20000;
                        }
                    }
                }
                if (color) {
                    backable = false;
                    if (whiteScore[i][j] > max) {
                        max = whiteScore[i][j];
                        u = i;
                        v = j;
                    } else if (whiteScore[i][j] == max) {
                        if (blackScore[i][j] > blackScore[u][v]) {
                            u = i;
                            v = j;
                        }
                    }

                    if (blackScore[i][j] > max) {
                        max = blackScore[i][j];
                        u = i;
                        v = j;
                    } else if (blackScore[i][j] == max) {
                        if (whiteScore[i][j] > whiteScore[u][v]) {
                            u = i;
                            v = j;
                        }
                    }
                } else {
                    backable = true;
                    if (blackScore[i][j] > max) {
                        max = blackScore[i][j];
                        u = i;
                        v = j;
                    } else if (blackScore[i][j] == max) {
                        if (whiteScore[i][j] > whiteScore[u][v]) {
                            u = i;
                            v = j;
                        }
                    }

                    if (whiteScore[i][j] > max) {
                        max = whiteScore[i][j];
                        u = i;
                        v = j;
                    } else if (whiteScore[i][j] == max) {
                        if (blackScore[i][j] > blackScore[u][v]) {
                            u = i;
                            v = j;
                        }
                    }
                }

            }
        }
    }
    oneStep(u, v, color);
    /*AI黑白两子轮替*/
    if (color) {
        chessBoard[u][v] = 1;
        for (var k = 0; k < count; k++) {
            if (wins[u][v][k]) {
                blackWin[k]++;
                whiteWin[k] = 6;
                if (blackWin[k] == 5) {
                    document.getElementById("win").innerHTML = "黑棋赢";
                    backable = false;
                    over = true;
                }
            }
        }
    } else {
        /*当且仅当在白子的时候记录步数统计数组*/
        for (var icnt = 0; icnt < 15; icnt++) {
            for (var jcnt = 0; jcnt < 15; jcnt++) {
                steps[step + 1][icnt][jcnt] = steps[step][icnt][jcnt];
            }
        }
        step++;
        position = step - 1; //步数递增且位置-1
        chessBoard[u][v] = 2;
        for (var k = 0; k < count; k++) {
            if (wins[u][v][k]) {
                whiteWin[k]++;
                blackWin[k] = 6;
                if (whiteWin[k] == 5) {
                    document.getElementById("win").innerHTML = "白棋赢";
                    backable = false;
                    over = true;
                }
            }
        }
    }

    if (!over) {
        color = !color;
    }
}


/**
 * 单击鼠标落子
 * 
 * @param {Event} e 
 */
chess.onclick = function(e) {
    if (step == 225 || position == 225) {
        document.getElementById("win").innerHTML = "平局";
        over = true;
    }
    /* 获取鼠标点击位置 */
    var x = e.offsetX;
    var y = e.offsetY;

    /* 将鼠标点击的位置转换成棋盘中对应的坐标 */
    var i = Math.floor(x / 30);
    var j = Math.floor(y / 30);

    if (over) { //判断游戏是否结束
        return;
    }

    switch (mode) {
        case "pvp": //玩家对战玩家
            /* 若点击位置无棋子，绘制棋子并将其存入二维数组 */
            if (chessBoard[i][j] == 0) {
                oneStep(i, j, color); //将棋子绘制在棋盘上

                if (color) { //黑子
                    /* 将棋子的位置记录在二维数组中，1为黑子，2为白子 */
                    document.getElementById("win").innerHTML = "请白子出棋";
                    backable = false;
                    chessBoard[i][j] = 1;

                    /* 统计每种赢法的棋子数量 */
                    for (var k = 0; k < count; k++) { //k为各赢法，count为赢法总数
                        if (wins[i][j][k]) { //第k种赢法中，该位置为true
                            blackWin[k]++; //第k种赢法棋子数量++
                            whiteWin[k] = 6; //在此设置成6，白子将无法赢
                            if (blackWin[k] == 5) { //第k种赢法有5子，判定为赢
                                document.getElementById("win").innerHTML = "黑子赢";
                                over = true;
                                backable = false;
                            }
                        }
                    }


                } else { //白子
                    document.getElementById("win").innerHTML = "请黑子出棋";
                    backable = true;
                    for (var icnt = 0; icnt < 15; icnt++) {
                        for (var jcnt = 0; jcnt < 15; jcnt++) {
                            steps[step + 1][icnt][jcnt] = steps[step][icnt][jcnt];
                        }
                    }
                    //debugger;
                    step++;
                    position = step - 1;
                    chessBoard[i][j] = 2;
                    for (var k = 0; k < count; k++) {
                        if (wins[i][j][k]) {
                            whiteWin[k]++;
                            blackWin[k] = 6;
                            if (whiteWin[k] == 5) {
                                document.getElementById("win").innerHTML = "白子赢";
                                over = true;
                                backable = false;
                            }
                        }
                    }

                }
                color = !color; //黑白轮换
            }
            break;

        case "pvc": //玩家对战电脑
            if (!color) {
                return;
            }
            if (chessBoard[i][j] == 0) {
                oneStep(i, j, color); //在棋盘落子
                chessBoard[i][j] = 1;
                //落子后统计到数组中
                for (var k = 0; k < count; k++) {
                    if (wins[i][j][k]) { //第k种赢法中，该位置为true
                        blackWin[k]++; //第k种赢法棋子数量++
                        whiteWin[k] = 6; //在此设置成6，白子将无法赢
                        if (blackWin[k] == 5) { //第k种赢法有5子，判定为赢
                            document.getElementById("win").innerHTML = "玩家赢！";
                            over = true;
                            backable = false;
                        }
                    }
                }
                if (!over) {
                    color = !color; //如果游戏没结束，计算机下棋，color为false
                    computerAI(false); //计算机AI
                    for (var icnt = 0; icnt < 15; icnt++) {
                        for (var jcnt = 0; jcnt < 15; jcnt++) {
                            steps[step + 1][icnt][jcnt] = steps[step][icnt][jcnt]; //下一步棋盘位置包含这一步棋盘位置
                        }
                    }
                    step++;
                    position = step - 1;
                    position++;

                }
            }
            break;

        case "cvc": //如果模式为ai互殴
            aiBattle();
            break;

    }
}