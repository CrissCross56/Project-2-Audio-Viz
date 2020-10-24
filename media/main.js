        import{drawLine,drawCircle,drawBlock,drawTriangle,makeColor,requestFullscreen,manipulatePixels,makeGradient1,makeGradient2,drawBackground} from './helpers.js';
        export{init,tintRed,sepia,invert,noise,preloadCar,carBodyURL};
       
		
		// SCRIPT SCOPED VARIABLES
				
		// 1- here we are faking an enumeration - we'll look at another way to do this soon 
		const SOUND_PATH = Object.freeze({
			sound1: "media/sturgill/01 Ronin.mp3",
			sound2: "media/sturgill/02 Remember to Breathe.mp3",
			sound3:  "media/sturgill/03 Sing Along.mp3"
		});

        //have some images to draw the car, these will be urls
        const carBodyURL = "media/album_carOnly.png";
		const carWindshieldURL = "media/album_carWindshield.png";
        //save the dimensions of the canvas
        let canvasWidth = 840;
        let canvasHeight = 600;

		// 2 - elements on the page
		let audioElement,canvasElement;
		
		// UI
		let playButton;
		
		// 3 - our canvas drawing context
		let drawCtx;
		
		// 4 - our WebAudio context
		let audioCtx;
		
		// 5 - nodes that are part of our WebAudio audio routing graph
		let sourceNode, analyserNode, gainNode;
		
		// 6 - a typed array to hold the audio frequency data
		const NUM_SAMPLES = 256;
		// create a new array of 8-bit integers (0-255)
		let audioData = new Uint8Array(NUM_SAMPLES/2); 
        //this array will hold audio waveform data
        let waveFormData = new Uint8Array(NUM_SAMPLES/2);
        //globally declare the maxRadius
        let maxRadius;
        //globally delcare the max line thickness for the circles
        let maxLineW;
      
        //these will help with pixel effects
        let invert = false;
        let tintRed = false;
        let noise = false;
        let sepia = false;
		
        //radii for the circles
        let smallCircR = 50;
        let bigCircR = 200;
        let smallCircROrig = 50;
        let bigCircROrig = 200;   


        //script scope variables to store images
        let carBody;
        let carWindshield;

        //variables to select how waveform data is dsiplayed
        let barsTris;


        //have vars to switch between diff BGs
        let background1 = true;
        let background2 = false;

        //have variables to hold the Red,Blue,and Green rgba value for the circles
        let rCircVal;
        let bCircVal;
        let gCircVal;



         //function to preload the image
         function preloadCar(url,callback){
            let carB = new Image();
            //let carW = new Image();
            //set up the urls to their variables
            carB.src = carBodyURL;
            carB.onload = _ =>{
              carBody = carB;
                callback()
            };
            //carWindshield.src = carWindshieldURL;
            carB.onerror = _ =>{
                  console.log(`Image at url "${carBodyURL}" wouldn't load! Check your URL! `);
            };
            
            
            
        }


		// FUNCTIONS
		function init(){
            
            //preload the images here 
            //preloadCar(carBodyURL,update);
            //once the preloading is done then call these methods
			setupWebaudio();
			setupCanvas();
			setupUI();
            preloadCar(carBodyURL,update)
			//update();
		}
		
		function setupWebaudio(){
			// 1 - The || is because WebAudio has not been standardized across browsers yet
			const AudioContext = window.AudioContext || window.webkitAudioContext;
			audioCtx = new AudioContext();
			
			// 2 - get a reference to the <audio> element on the page
			audioElement = document.querySelector("audio");
			audioElement.src = SOUND_PATH.sound3;
			
			// 3 - create an a source node that points at the <audio> element
			sourceNode = audioCtx.createMediaElementSource(audioElement);
			
			// 4 - create an analyser node
			analyserNode = audioCtx.createAnalyser();
			
			/*
			We will request NUM_SAMPLES number of samples or "bins" spaced equally 
			across the sound spectrum.
			
			If NUM_SAMPLES (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
			the third is 344Hz. Each bin contains a number between 0-255 representing 
			the amplitude of that frequency.
			*/ 
			
			// fft stands for Fast Fourier Transform
			analyserNode.fftSize = NUM_SAMPLES;
			
			// 5 - create a gain (volume) node
			gainNode = audioCtx.createGain();
			gainNode.gain.value = 1;
			
			// 6 - connect the nodes - we now have an audio graph
			sourceNode.connect(analyserNode);
			analyserNode.connect(gainNode);
			gainNode.connect(audioCtx.destination);
		}
		
        //sets up the 2d context variable
		function setupCanvas(){
			canvasElement = document.querySelector('canvas');
			drawCtx = canvasElement.getContext("2d");
            
              
            //draw car in between the background and the stuff being drawn in front
            drawCtx.drawImage(carBody,canvasWidth/2,canvasHeight/2,1,1);
            
		}
		
        //sets up the UI on the page
		function setupUI(){
			playButton = document.querySelector("#playButton");
			playButton.onclick = e => {
				console.log(`audioCtx.state = ${audioCtx.state}`);
				
				// check if context is in suspended state (autoplay policy)
				if (audioCtx.state == "suspended") {
					audioCtx.resume();
				}

				if (e.target.dataset.playing == "no") {
					audioElement.play();
					e.target.dataset.playing = "yes";
				// if track is playing pause it
				} else if (e.target.dataset.playing == "yes") {
					audioElement.pause();
					e.target.dataset.playing = "no";
				}
	
			};
			
			let volumeSlider = document.querySelector("#volumeSlider");
			volumeSlider.oninput = e => {
				gainNode.gain.value = e.target.value;
				volumeLabel.innerHTML = Math.round((e.target.value/2 * 100));
			};
			volumeSlider.dispatchEvent(new InputEvent("input"));
			
            //make the rgba color sliders for the circles work
            //red value slider
           let rCircValueSlider = document.querySelector("#rValueCirc");
            rCircValueSlider.oninput = e =>{
               rCircVal = e.target.value;
               rValueCircLabel.innerHTML = Math.round(((e.target.value*100)/255));
            };
            rCircValueSlider.dispatchEvent(new InputEvent("input"));
            
            //blue value slider
            let bCircValueSlider = document.querySelector("#bValueCirc");
            bCircValueSlider.oninput = e =>{
               bCircVal = e.target.value;
               bValueCircLabel.innerHTML = Math.round(((e.target.value*100)/255));
            };
            bCircValueSlider.dispatchEvent(new InputEvent("input"));
            
            //green value slider
            let gCircValueSlider = document.querySelector("#gValueCirc");
            gCircValueSlider.oninput = e =>{
               gCircVal = e.target.value;
               gValueCircLabel.innerHTML = Math.round(((e.target.value*100)/255));
               
            };
            gCircValueSlider.dispatchEvent(new InputEvent("input"));
            
            
            //make the slider that determines the thickness of the outline sof the circles
            let thicknessSlider = document.querySelector("#thicknessSlider");
            thicknessSlider.oninput= e => {
                maxLineW = e.target.value * 100;
                thicknessLabel.innerHTML = Math.round((e.target.value/2 * 100));
            }
            thicknessSlider.dispatchEvent(new InputEvent("input"));
            
			document.querySelector("#trackSelect").onchange = e =>{
				audioElement.src = e.target.value;
				// pause the current track if it is playing
				playButton.dispatchEvent(new MouseEvent("click"));
			};
			
			
			// if track ends
			audioElement.onended =  _ => {
				playButton.dataset.playing = "no";
			};
			
			document.querySelector("#fsButton").onclick = _ =>{
				requestFullscreen(canvasElement);
			};
			
		}
       
		
		function update() { 
			// this schedules a call to the update() method in 1/60 seconds
			requestAnimationFrame(update);
			
			/*
				Nyquist Theorem
				http://whatis.techtarget.com/definition/Nyquist-Theorem
				The array of data we get back is 1/2 the size of the sample rate 
			*/
			
			// populate the audioData with the frequency data
		
			analyserNode.getByteFrequencyData(audioData);
            //populate another array with waveform data
		   
			 analyserNode.getByteTimeDomainData(waveFormData);
			
            //erase
			drawCtx.clearRect(0,0,840,600);  
            //
			
            //draw backgrounds here
            //if we have selected bg1 then draw the first bg
            if(background1 && !background2){
                drawBackground(drawCtx,makeGradient1(drawCtx));
            }
            //if we have second bg selected then draw 2nd bg
            if(!background1 && background2){
                drawBackground(drawCtx,makeGradient2(drawCtx));
            }
            
          
            //draw car body

            drawCtx.drawImage(carBody,canvasWidth/2,canvasHeight/2);
            //then draw image of the windshield over it
            
            //reposition bars and circles to be a part of the car
            
            //draw several circles on the page that will have their radii change
            //also have some variables for the cricles radii
           
             
                bigCircR = audioData[0]/3;
                console.log(audioData[0]);
                smallCircR = audioData[0]/6;
            
              drawCircle(drawCtx,maxLineW,canvasElement.width/2, canvasElement.height/2, bigCircR, 0, makeColor(rCircVal,bCircVal,gCircVal,1));
              //draw four more circles
              drawCircle(drawCtx,maxLineW,100,100,smallCircR,0,makeColor(rCircVal,bCircVal,gCircVal,1));
              drawCircle(drawCtx,maxLineW,740,100,smallCircR,0,makeColor(rCircVal,bCircVal,gCircVal,1));
              drawCircle(drawCtx,maxLineW,100,500,smallCircR,0,makeColor(rCircVal,bCircVal,gCircVal,1));
              drawCircle(drawCtx,maxLineW,740,500,smallCircR,0,makeColor(rCircVal,bCircVal,gCircVal,1));
            
            
            
            
            
            //if the user picked triangles then
            if(barsTris == "triangles"){
                let barWidth = 3;
			    let barSpacing = 2;
			    let barHeight = 100;
			    let topSpacing = 50;
			    let barLength = 1;
            // loop through the data and draw triangles
			for(let i=0; i<waveFormData.length/2; i++) { 
              
                
				drawCtx.fillStyle = 'rgba(0,255,0,0.6)'; 
				
               
                let x = i *(barWidth + barSpacing);
                let y = topSpacing + 256-waveFormData[i]/6;
                
                drawTriangle(drawCtx,(x/1.5) + 330, y/2 + 400, (x/1.5) + 330 + barWidth/1.5, y/2 + barHeight/2 + 400, (x/1.5) + 330 -barWidth/1.5, y/2 + barHeight/2 + 400, 'rgba(0,255,0,0.6)');
                
			     }
            }
		
            //if the user has selected bars then display bars
            if(barsTris == "bars"){
                let barWidth = 3;
			    let barSpacing = 2;
			    let barHeight = 100;
			    let topSpacing = 50;
			    let barLength = 1;
                //loop through the data and draw bars
            for(let i=0; i<audioData.length/10; i++) { 
				// the higher the amplitude of the sample (bin) the taller the bar
				// remember we have to draw our bars left-to-right and top-down
				
            
                //top right of the bars
                drawBlock(drawCtx, i*(3+barSpacing/2) + 420, 300,barWidth, -audioData[i] * barLength/10,"red");
                
                //top left of the bars
               drawBlock(drawCtx, 820 - (i*(3+barSpacing/2) + 400), 300,-barWidth, -audioData[i] * barLength/10,"red");
          
                //bottom left of the bars 
                 drawBlock(drawCtx, 820 - (i*(3+barSpacing/2) + 400), 300,-barWidth, audioData[i] * barLength/10,"red");
                
                
                //bottom right of the bars
                drawBlock(drawCtx, i*(3+barSpacing/2) + 420, 300,barWidth, audioData[i] * barLength/10,"red");
                
             
			     }
            }
            
            //check for if we are using bg 1
            document.getElementById('first').onclick =
                function(e){
                background1 = true;
                background2=false;
            }
             //check for if we are using bg 2
            document.getElementById('second').onclick =
                function(e){
                background1 = false;
                background2 = true;
            }
            //check for if we are showing triangles
            document.getElementById('tri').onclick = 
             function(e){
                barsTris = "triangles";
            }
            //check for if we are drawing bars
            document.getElementById('bars').onclick = 
                function(e){
                barsTris = "bars";
            }
             document.getElementById('redTCheckBox').onclick =
            function(e){
                tintRed = !tintRed;
            }
            
            document.getElementById('invCheckbox').onclick =
            function(e){
                invert = !invert;
            }
             
            document.getElementById('nCheckBox').onclick =
            function(e){
                noise = !noise;
            }
            
            document.getElementById('sCheckBox').onclick =
            function(e){
                sepia = !sepia;
            }
            
            //shrink radii of circle at end of loop
            bigCircR -= audioData[0];
            smallCircR -= audioData[0];
            
            
            manipulatePixels(drawCtx);
			 
		} 