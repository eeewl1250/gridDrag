// px坐标(相对于父元素来说的left和top）转化为格子坐标
function gridAxis(x, y) {
    //取得格子实际大小
    var X = Math.floor((x + 1) / gridWidth),//+1是为了确保不误判到上一个
        Y = Math.floor((y + 1) / gridWidth);
    return axisRange(X, Y, gridNumOneline);
}
//限定格子坐标范围
function axisRange(X, Y, gridNumOneline){
    if(X > gridNumOneline - 1){
        X = gridNumOneline - 1;
    } else if(X < 0) {
        X = 0;
    }
    if(Y < 0){
        Y = 0;
    }
    return [X, Y];
}

// 格子坐标转换回去(相对于父元素来说的left和top）
function windowAxis(X, Y) {
    return [X*gridWidth, Y*gridWidth];
}

//拖动到(X,Y)位置——格子坐标
function dragTo(obj) {
    obj.onmousedown = function(e) {

        console.log("----------New move--------");

        //设置当前目标显示在所有目标之上
        this.style.zIndex = 100;

        var ev = e || window.event;
        var baseObj = this.parentNode;

        // 取得点击鼠标时的位置
        var oriLeft = parseInt(this.style.left),
            oriTop = parseInt(this.style.top),
            oriX = baseObj.offsetLeft + oriLeft, //本次移动前的位置
            oriY = baseObj.offsetTop + oriTop,
            // 计算鼠标相对于obj的左上角的位置
            relX = ev.clientX - oriX,
            relY = ev.clientY - oriY;
        //console.log("ori: " + oriX + ", " + oriY);

        //移动前的格子大坐标
        this.lastAxis = gridAxis(oriTop, oriLeft);
        console.log("moveBefore: " + this.lastAxis);

        this.onmousemove = function(e) {

            var ev = e || window.event,
                baseObj = this.parentNode;

            //鼠标移动时，obj随之移动
                //当前obj相对于容器的地址
            var nowLeft = ev.clientX - relX - baseObj.offsetLeft,
                nowTop = ev.clientY - relY - baseObj.offsetTop;
            //console.log("now: " + nowX + ", " + nowY);

            this.style.left = nowLeft  + "px";
            this.style.top = nowTop + "px";
            //console.log(this.style.left + ", " + this.style.top);

            //吸入到特定的格子
                // 中心点的位置在哪个格子里，就放到哪个格子
            var cenLeft = nowLeft + gridWidth/2,
                cenTop = nowTop + gridWidth/2;
            this.centerGrid = gridAxis(cenTop, cenLeft);
            console.log("centerGrid = " + this.centerGrid);

            this.onmouseleave = function(e) {
                //回到原本的格子
                this.style.left = oriLeft + "px";
                this.style.top = oriTop + "px";

                this.style.zIndex = 1;
                this.onmousemove = null;
                this.onmmouseup = null;
                this.onmouseleave = null;
            };
        };

        this.onmouseup = function(e) {

            //转化中心点的格子位置，即得到目前obj应处的格子、相对于父元素的位置
            var winAxis = windowAxis(this.centerGrid[0],this.centerGrid[1]);

            //吸入格子位置
            this.style.left = winAxis[1] + "px";
            this.style.top = winAxis[0] + "px";

            //判断此位置上有否元素，若有，位置互换
            //this.lastAxis = winAxis;
            var fi = arrayFind(gridPostList, this.centerGrid);
            gridPostList[this.gridIndex] = this.centerGrid;
            if(fi >= 0){ //找到位置上的元素
                console.log(fi);

                gridPostList[fi] = this.lastAxis;
                //console.log(gridPostList);

                var subGrid = document.getElementsByClassName("grid")[fi];
                subGrid.style.left = this.lastAxis[1]*gridWidth  + "px";
                subGrid.style.top = this.lastAxis[0]*gridWidth + "px";
            } else {
                console.log(-1);
            }

            this.style.zIndex = 1;
            this.onmousemove = null;
            this.onmouseleave = null;
            this.onmmouseup = null;
        };
    };
}

//查找数组中是否包含某个值
function arrayFind(a, t) { // array, target
    for(var i = 0, len = a.length; i < len; i++){
        if(a[i].toString() == t.toString()){
            return i;
        }
    }
    return -1;
}


//------------------test-----------------------
var gridNumOneline = 5; //一行有几个格子
var gridWidth = document.getElementById("container").offsetWidth / gridNumOneline;
var gridPostList = [];

//事件绑定
var grids = document.getElementsByClassName("grid");
for(var i = 0, len = grids.length; i < len; i ++) {
    var thisGrid = grids[i];
    dragTo(thisGrid);
    //初始化
    thisGrid.gridIndex = i;
    thisGrid.orgGridPos = [Number.parseInt(i / gridNumOneline), i % gridNumOneline];
    thisGrid.centerGrid = thisGrid.orgGridPos;
    //console.log(thisGrid.orgGridPos);
    thisGrid.oriPos = windowAxis(thisGrid.orgGridPos[0], thisGrid.orgGridPos[1]);
    gridPostList.push(thisGrid.orgGridPos);

    thisGrid.style.left = thisGrid.oriPos[1] + "px";
    thisGrid.style.top = thisGrid.oriPos[0] + "px";//注意这里的顺序
}
//console.log(gridPostList);