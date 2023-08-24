let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
  type = "canvas";
}

const appDiv = document.getElementById("app");

const app = new PIXI.Application({ background: '#000000', resizeTo: appDiv });
appDiv.appendChild(app.view);

let brushSize = 20;

// prepare circle texture, that will be our brush
const brush = new PIXI.Graphics()
    .beginFill(getColorSequence(1))
    .drawCircle(0, 0, brushSize);

// Create a line that will interpolate the drawn points
const line = new PIXI.Graphics();

setup();

function setup()
{
    const { width, height } = app.screen;
    const stageSize = { width, height };

    const renderTexture = PIXI.RenderTexture.create(stageSize);
    const renderTextureSprite = new PIXI.Sprite(renderTexture);

    app.stage.addChild(
        renderTextureSprite,
    );

    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;
    app.stage
        .on('pointerdown', pointerDown)
        .on('pointerup', pointerUp)
        .on('pointerupoutside', pointerUp)
        .on('pointermove', pointerMove);

    let dragging = false;
    let lastDrawnPoint = null;
    let i = 0;
    let color = nextColor();
    

    function pointerMove({ global: { x, y }})
    {
        if (dragging)
        {
            brush.position.set(x, y);
            app.renderer.render(brush, {
                renderTexture,
                clear: false,
                skipUpdateTransform: false,
            });
            // Smooth out the drawing a little bit to make it look nicer
            // this connects the previous drawn point to the current one
            // using a line
            if (lastDrawnPoint)
            {
                line
                    .clear()
                    .lineStyle({ width: brushSize*2, color: color })
                    .moveTo(lastDrawnPoint.x, lastDrawnPoint.y)
                    .lineTo(x, y);
                app.renderer.render(line, {
                    renderTexture,
                    clear: false,
                    skipUpdateTransform: false,
                });
            }
            lastDrawnPoint = lastDrawnPoint || new PIXI.Point();
            lastDrawnPoint.set(x, y);
        }
    }

    function pointerDown(event)
    {
        dragging = true;
        pointerMove(event);
    }

    function pointerUp(event)
    {
        dragging = false;
        lastDrawnPoint = null;
        color = nextColor();
        brush.endFill().beginFill(color)
        .drawCircle(0, 0, brushSize);
    }

    function nextColor() {
      i = i + 1;
      return getColorSequence(i);
    }
}

function getColorSequence(n) {
  center = 128;
      w = 127;
      frequency = Math.PI*2/127;
      red   = Math.sin(frequency*n+2) * w + center;
      green = Math.sin(frequency*n+0) * w + center;
      blue  = Math.sin(frequency*n+4) * w + center;
      return RGB2Color(red, green, blue);
}


function RGB2Color(r, g, b) {
  return r*0x010000 + g*0x000100 + b*0x000001
}


