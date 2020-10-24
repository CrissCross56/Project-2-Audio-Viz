export{drawLine,drawCircle,drawTriangle,drawBlock,makeColor,requestFullscreen,manipulatePixels,makeGradient1,makeGradient2,drawBackground};
import{tintRed,sepia,invert,noise} from './main.js';

    

        function drawBackground(drawCtx,color)
        {
            drawCtx.save();
            drawCtx.fillStyle = color;
            drawCtx.fillRect(0,0,drawCtx.canvas.width,drawCtx.canvas.height);
            drawCtx.restore();
        }

        
        function drawLine(drawCtx,x1,y1,x2,y2,color)
        {
            drawCtx.fillStyle = color;
            drawCtx.beginPath();
            drawCtx.moveTo(x1,y1);
            drawCtx.lineTo(x2,y2);
            drawCtx.fill();
            drawCtx.closePath();
        }

        function drawCircle(drawCtx,lineW,x,y,radius,startAngle,color)
        {
            drawCtx.save();
            drawCtx.strokeStyle = color;
            drawCtx.lineWidth = lineW;
            drawCtx.beginPath();
            drawCtx.arc(x,y,radius,startAngle,2 * Math.PI);
            drawCtx.stroke();
            drawCtx.closePath();
            drawCtx.restore();
        }
        

        function drawBlock(drawCtx,x,y,width,height,color)
        {
            drawCtx.save();
            drawCtx.fillStyle = color;
            drawCtx.fillRect(x,y,width,height);
            drawCtx.restore();
        }

        function drawTriangle(drawCtx,x,y,x2,y2,x3,y3,color)
        {
                drawCtx.save();
                drawCtx.fillStyle = color;
                drawCtx.beginPath();
             //   let x = i *(barWidth + barSpacing);
             //   let y =  topSpacing + 256-audioData[i];
                drawCtx.moveTo(x,y);
                drawCtx.lineTo(x2,y2);
                drawCtx.lineTo(x3,y3);
                drawCtx.fill();
                drawCtx.closePath();
                drawCtx.restore();
        }
        
        function makeColor(red, green, blue, alpha){
   			var color='rgba('+red+','+green+','+blue+', '+alpha+')';
   			return color;
		}

  function makeGradient1(drawCtx)
        {
            
            let gradient = drawCtx.createLinearGradient(0,0,0,600);
            gradient.addColorStop(0,"black");
            gradient.addColorStop(1,"#1458d9")
            return gradient;
        }    
    function makeGradient2(drawCtx){
        let gradient = drawCtx.createLinearGradient(0,0,0,600);
        gradient.addColorStop(0,"#fd5373");
        gradient.addColorStop(0.3,"#fd5356");
        gradient.addColorStop(0.6,"#fd6c53");
        gradient.addColorStop(0.9,"#fd8953");
        gradient.addColorStop(1,"white");
        return gradient;
    }
	
		function requestFullscreen(element) {
			if (element.requestFullscreen) {
			  element.requestFullscreen();
			} else if (element.mozRequestFullscreen) {
			  element.mozRequestFullscreen();
			} else if (element.mozRequestFullScreen) { // camel-cased 'S' was changed to 's' in spec
			  element.mozRequestFullScreen();
			} else if (element.webkitRequestFullscreen) {
			  element.webkitRequestFullscreen();
			}
			// .. and do nothing if the method is not supported
		}

 function manipulatePixels(ctx){
            //get all of the rgba pixel data of the canvas by grabbing the ImageData Object
            let imageData =  ctx.getImageData(0,0, ctx.canvas.width, ctx.canvas.height);
            
            //29 imageData.data is an 8 bit typed array -  values range from 0-255
            //imageData.data contains 4 values per pixel: 4 x canvas.width X canvas.height = 1,024,00 values
            //looping thru this in 60 fps
            let data = imageData.data;
            let length = data.length;
            let width = imageData.width;
            
            //iterate thru each pixel
            //we step by 4 so we can manipulate 1 pixel per iteration
            //data[i] is the red value
            //data[i + 1] is the green value
            //data [i + 2] is the blue value
            //data [i + 3] is the alpha value
            
            let i// declaring i outside of tje loop is an optimization
            for(i = 0; i < length; i += 4){
                //increase red value only
                if(tintRed){
                    //just the red channel this time
                    data[i] = data[i] + 100;
                }
                //inversion
                 if(invert){
                let red = data[i], green = data[i+1], blue = data[i+2];
                data[i] = 255 - red; // set red value
                data[i + 1] = 255 - green; // set blue value
                data[i + 2] = 255 - blue; // set green value
            //is the alpha but leave that alone for now    data[i + 3] 
                }
                //noise
                if (noise && Math.random() < .10){
                    data[i] = data[i+1] = data[i+2] = 128; // gray noise
                    //data[i] = data[i+1] = data[i+2] = 255; // or white noise
                    //data[i] = data[i+1] = data[i+2] = 0; // or black noise
                    data[i+3] = 255; // alpha
                }
                 //34 sepia tone
                if(sepia)
                {
                    let red = data[i], green = data[i + 1], blue = data[i+ 2];
                    
                    data[i] = (red * .393) + (green * 0.769) + (blue * .189); //set red value
                    data[i + 1] = (red * .349) + (green * .686) + (blue * .168); //set green value
                    data[i + 2] = (red * .272) + (green * .534) + (blue * .168); //set blue value
                    
                }
            
            }
           
            
            //invert every color channel
        
             //put the modified data back on the canvas
            ctx.putImageData(imageData,0,0);
        }
        