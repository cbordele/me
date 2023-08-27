let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
  type = "canvas";
}

const appDiv = document.getElementById("app");

const app = new PIXI.Application({ background: '#000000', resizeTo: appDiv });
appDiv.appendChild(app.view);

let brushSize = 20;
let color = getColorSequence(1);

// prepare circle texture, that will be our brush
const brush = new PIXI.Graphics()
    .beginFill(color)
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

    const keyUp = keyboard("ArrowUp");
    const keyDown = keyboard("ArrowDown");

    keyUp.press = () => {
         brushSize = brushSize + 2;
         brushSet();
    }

    keyDown.press = () => {
        brushSize = brushSize - 2;
        if (brushSize < 2) {
            brushSize = 2;
        }
        brushSet();
    }
    

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
        brushSet();
    }

    function nextColor() {
      i = i + 1;
      return getColorSequence(i);
    }


    function brushSet() {
        brush.clear();
        brush.beginFill(color)
        .drawCircle(0, 0, brushSize);
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


function keyboard(value) {
    const key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = (event) => {
      if (event.key === key.value) {
        if (key.isUp && key.press) {
          key.press();
        }
        key.isDown = true;
        key.isUp = false;
        event.preventDefault();
      }
    };
  
    //The `upHandler`
    key.upHandler = (event) => {
      if (event.key === key.value) {
        if (key.isDown && key.release) {
          key.release();
        }
        key.isDown = false;
        key.isUp = true;
        event.preventDefault();
      }
    };
  
    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
    
    window.addEventListener("keydown", downListener, false);
    window.addEventListener("keyup", upListener, false);
    
    // Detach event listeners
    key.unsubscribe = () => {
      window.removeEventListener("keydown", downListener);
      window.removeEventListener("keyup", upListener);
    };
    
    return key;
  }

