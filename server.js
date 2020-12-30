var app= require('express')();
var http=require('http').createServer(app);
var io=require('socket.io')(http);
var path=require('path');
var fs=require('fs');

const file="info.log";
const port= 5000;
var lastLength=0;

io.on('connection',(socket)=>{
	console.log("socket connection established!");
	fs.readFile(file, 'utf8', function(err, dataOld){  
		if(err)	throw err;	//handle read error

		let line=dataOld.split('\n');
		let startingFile=[];

		// print last 10 lines initially
		var ind=0;
		if(line.length>10){
			for(var i=line.length-10;i<line.length;i++){
				startingFile[ind++]=line[i];
			}
		}
		socket.emit('file changed', startingFile);
		lastLength=line.length;
		fs.watchFile(file, (curr, prev) => {
			fs.readFile(file, 'utf8', function(error, data){  	
				if(error)	throw error;	// handle error

				let lines=data.split('\n');
				var len=lines.length;
				let updatedFile=[];
				var index=0;
				if(lastLength){
					for(var i=lastLength;i<len;i++){
						updatedFile[index++]=lines[i];
					}
				}
				else{
					if(len>10){	// print last 10 lines of updated file
						for(var i=len-10;i<len;i++){
							updatedFile[index++]=lines[i];
						}		
					}
					else{	// if updated file is less than 10 lines
						for(var i=0;i<len;i++){
							updatedFile[index++]=lines[i];
						}
					}
				}
				lastLength=len;
				io.emit('file changed', updatedFile);
			});
		});
	});
});

app.get('/',(req,res)=>{
	res.redirect("http://localhost:5000/logs");
});

app.get('/logs',(req,res)=>{
	res.sendFile(path.join(__dirname+'/index.html'));
});

http.listen(port, () => {
  console.log('listening on port:'+port);
});