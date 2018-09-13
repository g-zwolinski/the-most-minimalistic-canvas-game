var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var point = {};
var calculateAspectRatioFit = function(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return {
      width: srcWidth * ratio,
      height: srcHeight * ratio
    };
};

var $canvas = $(canvas);
var $container = $('.container');
var size;
var resizeIt = function() {
    size = calculateAspectRatioFit($canvas.width(), $canvas.height(), $container.width(), $container.height());
    console.log($canvas.width(), $canvas.height(), $container.width(), $container.height());
    $canvas.css('height', size.height);
    $canvas.css('width', size.width);
};

resizeIt();
$(window).on('resize', resizeIt);
var score = 0;
var highScore = 0;
var point = {};
var animatingPoint = false;
var radius = 50;
function drawPoint(angle, distance, point){
    var x = point.x + radius * Math.cos(-angle*Math.PI/180) * distance;
    var y = point.y + radius * Math.sin(-angle*Math.PI/180) * distance;
    //console.log(x, y, point);
    ctx.beginPath();
    ctx.fillStyle = "#000";
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fill();
}

function getLength(line){
    var a = line.x1 - line.x2
    var b = line.y1 - line.y2
    return Math.sqrt( a*a + b*b );
}

var lines = [];
function saveLine(){
    var firstPoint = {};
    var secondPoint = {};
    firstPoint.x = point.x + radius * Math.cos(-(deltaAngle)*Math.PI/180) * 1;
    firstPoint.y = point.y + radius * Math.sin(-(deltaAngle)*Math.PI/180) * 1;
    secondPoint.x = point.x + radius * Math.cos(-(180+deltaAngle)*Math.PI/180) * 1;
    secondPoint.y = point.y + radius * Math.sin(-(180+deltaAngle)*Math.PI/180) * 1;
    lines.unshift({x1: firstPoint.x, y1: firstPoint.y, x2: secondPoint.x, y2: secondPoint.y});

    if(lines[0] != undefined && lines[1] != undefined){
        if(line_intersect(lines[0].x1,lines[0].y1,lines[0].x2,lines[0].y2,lines[1].x1,lines[1].y1,lines[1].x2,lines[1].y2)){
            score = score + getLength(lines[0]);
        }else{
            if(score > highScore) highScore = score;
            score = 0;
        }
    }
}

var deltaAngle = 0;
var dirDeltaAngle = 1;
var radiusStep = 0.6;
var angleStep = 3;

var deltaMain = 0.3;

function line_intersect(x1, y1, x2, y2, x3, y3, x4, y4)
{
    var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
    if (denom == 0) {
        return null;
    }
    ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
    ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
    var results = {
        x: x1 + ua*(x2 - x1),
        y: y1 + ua*(y2 - y1),
        seg1: ua >= 0 && ua <= 1,
        seg2: ub >= 0 && ub <= 1
    };
    return (results.seg1 && results.seg2);
}

setInterval(function(){ 
    if(deltaAngle==90 || deltaAngle==-90){
        dirDeltaAngle = dirDeltaAngle * -1;
    }
    ctx.beginPath();
    ctx.rect(0, 0, size.width, size.height);
    ctx.fillStyle = "#fff";
    ctx.fill();
    if(animatingPoint){
        radius = radius + radiusStep;
        //ctx.beginPath();
        //ctx.arc(point.x,point.y,radius,0,2*Math.PI);
        //ctx.stroke();
        drawPoint(0+deltaAngle, 1, point);
        drawPoint(180+deltaAngle, 1, point);
        if(point.x - radius <= 0||
           point.x + radius >= size.width||
           point.y - radius <= 0||
           point.y + radius >= size.height
        ){
            saveLine();
            animatingPoint = false;
        }
    }else{
        radius = 0;
    }
    deltaAngle = deltaAngle + angleStep*dirDeltaAngle;
    lines.forEach(function(line, index){
        line.y1 = line.y1 + deltaMain;
        line.y2 = line.y2 + deltaMain;
        ctx.beginPath();
        ctx.lineWidth=10;
        ctx.moveTo(line.x1,line.y1);
        ctx.lineTo(line.x2,line.y2);
        ctx.stroke();
    });
    ctx.fillStyle = "black";
    ctx.font = "bold 16px Arial";
    ctx.fillText('score: ' + score.toFixed(0), 2, 16);
    ctx.fillText('highest: ' + highScore.toFixed(0), 2, 32);
    //console.log(deltaAngle);
}, 10);

point.x = 0; //stores user's click on canvas
point.y = 0; //stores user's click on canvas
function clickOnCanvas(event) {
    var x = event.offsetX;
    var y = event.offsetY;
    console.log(y, lines[0]);
    if(lines[0] != undefined && (y > lines[0].y1 && y > lines[0].y2)) return;
    animatingPoint = !animatingPoint;
    if(!animatingPoint){
        saveLine();
    }
    
    point.x = x;
    point.y = y;
    
    //console.log("x coords: " + (point.x*100/size.width).toFixed(0) + ", y coords: " + (point.y*100/size.height).toFixed(0));
}
