function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const TOL = 100;
const H = 50;
const W = 50;
const STEP = 3;

class Animator {
    constructor() {
        this.canvas = document.getElementById('play');
        this.ctx = this.canvas.getContext('2d');
    }

    drawOrClearRect(pt, shouldClear) {
        console.log(pt, shouldClear);
        this.ctx.save();
        this.ctx.translate(pt['x'], pt['y']);
        this.ctx.rotate(pt['ang']);
        this.ctx.beginPath();
        if (shouldClear === true) {
            this.ctx.clearRect(-TOL, -TOL, W + TOL, H + TOL);
        } else {
            this.ctx.strokeStyle = 'rgb(0, 255, 0)';
            this.ctx.rect(0, 0, W, H);

            this.ctx.fillStyle = 'rgba(255, 0, 0)';
            this.ctx.fillRect(0, 0, W, H);
        }
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }

    async animate(path) {
        this.ctx.resetTransform();
        this.ctx.translate(0, this.canvas.height);
        this.ctx.scale(1, -1);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        var idx = 0;
        var lastpt = undefined;
        for (idx = 0; idx < path.length; idx++) {
            if (lastpt !== undefined) {
                this.drawOrClearRect(lastpt, true);
            }
            var pt = path[idx];
            this.drawOrClearRect(pt);
            lastpt = pt;

            await sleep(10);
        }
    }

}

function computePath() {
    var path = [];

    var pos = $('#init').position();
    var ang = $('#slider').slider("value")*Math.PI/180;

    // x - W*cos(ang) = 
    var x = pos.left + H*Math.sin(ang);
    var y = 644 - pos.top - H*Math.cos(ang) - H*Math.sin(ang);

    $('#steps-list').children('div').each(function(idx, elem) {
        var steering = $('input[name="steering"]', elem).val();
        var rotations = $('input[name="rotations"]', elem).val();

        for (var idx=0; idx < Math.floor(rotations/0.1); idx++) {
            path.push({
                x: x,
                y: y,
                ang: ang
            });
            ang += steering/1000;

            var dx = STEP*Math.cos(ang);
            var dy = STEP*Math.sin(ang);
            x += dx;
            y += dy;
            ang = ang;
        }
    });

    return path;
}

async function animatePath() {
    var path = computePath();
    var animator = new Animator();
    $('#init').hide();
    $('#play-button').prop('disabled', true);
    await animator.animate(path);
    $('#init').show();
    $('#play-button').prop('disabled', false);
}

$(function() {
    $('#init').draggable();
    $('#slider').slider({
        min: -90,
        max: 90,
        value: 0,
        slide: function(event, ui) {
            var val = -ui.value;
            $('#init').css({
                'transform' : 'rotate(' + val + 'deg)',
            });
            $('#slider-text').text(-val + ' degrees')
        }
    });

    $('#add-step-button').click(function(event, ui) {
        var newstep = $('#step-template').clone();
        $('#steps-list').append(newstep);
        $('#delete-button', newstep).click(function() {
            newstep.remove();
        });
    });

    $('#play-button').click(function() {
        animatePath();
    });

})
