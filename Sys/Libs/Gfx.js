//
// DS + HTML compatible game object (based on pixi.js)
// Copyright droidscript.org
//
// Released under BSD license
//

//Globals
var _ww=0, _wh=0, _asp=0; //window width/height/aspect.
var _isGles = (window.navigator.userAgent=="GlesJS"); 
var _isWebView = false;
var _scripts = [];

//Standard Framework callbacks.
var OnAnimate = function(){}
var OnControl = function(){}
var OnCollide = function( a,b ) {}

//Runtime option flags.
var cfg = {Game:0, Landscape:0, Portrait:0, NoDom:0, Transparent:0 }

//Called by host html page in onload event.
function _OnStart()
{ 
    gfx._Init();
    OnLoad()
    setTimeout( _OnReady, 1000 ); //hack: 300 is too short
}

//Called when we are ready to play.
function _OnReady()
{
    OnReady();
    gfx.isReady = true;
}

//Fix sys paths for browsers.
function _fixFilePath( file )
{
	if( file.indexOf("/Sys/")==0 ) {
		if( _isWebView ) file = "file:///android_asset" + file.replace("/Sys/","/"); 
		else if( !_isGles ) file = file.substring(1);
	}
	return file;
}

var gfx = new function Gfx()
{
	//Private vars.
    var self = this;
	var antialias = false; 	//true slows down sprite batching massively but makes shape drawing much prettier.
    var _anim_t = 0;
    var _phys = null;
    var _tLastSound = 0;
    var _touchX=0, _touchY=0, _touchDir=null;
    var _lastTouchDir=null, _lastKeyState=null;
   
	//Callbacks
    var _onTouchDown = null;
    var _onTouchMove = null;
    var _onTouchUp = null;
	var _onKeyDown = null;
	var _onKeyUp = null;
	
    //--- Public properties -------------------
	
	this.data = {} //User data
    this.width = _ww = window.innerWidth;
    this.height = _wh = window.innerHeight;
    this.aspect = _asp = this.width / this.height;
    this.stage = new PIXI.Stage();
    this.renderer = PIXI.autoDetectRenderer(this.width, this.height, null, null, antialias);
	this.objects = [];
	this.keyDown = null;  //Currently pressed key.
	this.keyState = null; //Current key state.
	this.touchX, this.touchY, this.touchDir, this.touching=false;
	this.isReady = false;
	
    //--- Init the engine ----------------------
	
	document.body.appendChild( this.renderer.view ); //<-for html version.
	PIXI.pixels = false; 	//Default to fractional mode.
	PIXI.local = true; 		//Default to working locally (no Ajax).
	PIXI.isGles = _isGles;  //Are we using the gles framework.
	PIXI.imgError = (_isGles?"/":"") + "Sys/Img/Question.png"  //Image error placeholder.
	
	//Init the engine.
	this._Init = function()
	{
    	//Handle keyboard events.
    	document.addEventListener( "keydown", function(ev)
    	{
    		self.keyDown = ev.key; self.keyState = "Down"; 
    		if( _onKeyDown ) _onKeyDown( ev.key )
    	} );
    		
    	document.addEventListener( "keyup", function(ev)
    	{
    		self.keyState = "Up";
    		OnControl( _touchDir, _touchX, _touchY, self.keyState, self.keyDown )
    		if( _onKeyUp ) _onKeyUp( ev.key ); self.keyDown = null; self.keyState = null; 
    	} );
    		
    	//Handle touch events.
    	if( !_isWebView ) document.addEventListener( _isGles ?"touchstart":"mousedown", function(ev) 
    	{
    		_touchX = self.touchX = _isGles ? ev.touches[0].screenX/_ww : ev.offsetX/_ww;
    		_touchY = self.touchY = _isGles ? ev.touches[0].screenY/_wh : ev.offsetY/_wh;
    		_touchDir = self.touchDir = "Down"; self.touching = true;
			OnControl( _touchDir, _touchX, _touchY, self.keyState, self.keyDown )
    		//console.log( "mousedown:" + self.touchX )
    		if( _onTouchDown ) _onTouchDown( _touchX, _touchY );
    	}, false);
    	
    	if( !_isWebView ) document.addEventListener( _isGles ?"touchmove":"mousemove", function(ev)
		{
			if( self.touching )
			{
				_touchX = self.touchX = _isGles ? ev.touches[0].screenX/_ww : ev.offsetX/_ww;
				_touchY = self.touchY = _isGles ? ev.touches[0].screenY/_wh : ev.offsetY/_wh;
				_touchDir = self.touchDir = "Move";
				OnControl( _touchDir, _touchX, _touchY, self.keyState, self.keyDown )
				//console.log( "mousemove:" + self.touchX )
				if( _onTouchMove ) _onTouchMove( _touchX, _touchY );
			}
    	}, false);
    		
    	if( !_isWebView ) document.addEventListener(_isGles ?"touchend":"mouseup", function(ev)
    	{
    		_touchDir = self.touchDir = "Up";
    		//console.log( "mouseup")
    		OnControl( _touchDir, _touchX, _touchY, self.keyState, self.keyDown )
    		_touchX = self.touchX = _touchY = self.touchY = null;
    		_touchDir = self.touchDir = null; self.touching = false;
    		if( _onTouchUp ) _onTouchUp( _touchX, _touchY );
    	}, false);
	}
	
	//Handle touch events from webview.
	//(html touch events are too slow on tablets)
	this._HandleTouch = function( action, x, y )
	{
	    //console.log( "_HandleTouch:" + x + ", " + y + "," + action)
	    if( !self.isReady ) return;
	    
	     if( action=="Down" ) 
	     {
	        _touchX = self.touchX = x;
    		_touchY = self.touchY = y;
    		_touchDir = self.touchDir = "Down";
			OnControl( _touchDir, _touchX, _touchY, self.keyState, self.keyDown )
    		if( _onTouchDown ) _onTouchDown( _touchX, _touchY );
	     }
		 else if( action=="Move" ) 
	     {
			_touchX = self.touchX = x;
    		_touchY = self.touchY = y;
    		_touchDir = self.touchDir = "Move";
			OnControl( _touchDir, _touchX, _touchY, self.keyState, self.keyDown )
    		if( _onTouchMove ) _onTouchMove( _touchX, _touchY );
		 }
	     else if( action=="Up" ) 
	     {
	        _touchDir = self.touchDir = "Up";
    		OnControl( _touchDir, _touchX, _touchY, self.keyState, self.keyDown )
    		_touchX = self.touchX = _touchY = self.touchY = null;
    		_touchDir = self.touchDir = null;
    		if( _onTouchUp ) _onTouchUp( _touchX, _touchY );
	     }
	}
	
	//--- Public methods------------------------
	
    //Enables pixel mode for basic sprites.
    this.SetPixelMode = function( usePixels ) { PIXI.pixels = usePixels }	
	
    //Loads and execute an external script.
    this.Script = function( url, callback ) 
    {
       if( _isGles ) { 
           _script( url );
           callback();
       }
       else if( _isWebView )  //Todo: synchrounous version?
       {
            if( _scripts[url] ) return; 
            if( url.slice(-4)==".dsj" ) url += ".js";
    		var head = document.getElementsByTagName('head')[0];
    		var script = document.createElement('script');
    		script.type = 'text/javascript';
    		script.src = url;
    		script.onload = callback;
    		head.appendChild(script);
            _scripts[url] = true;
        }
    }
	
	//Execute code in the main DS app.
    this.AppExec = function( js ) 
    { 
        if( _isGles ) _app.execute(js) 
        else if( _isWebView ) prompt( "#", "App.Execute("+js );
    }
	
	//Hardware calls
    this.Vibrate = function( pattern ) 
    { 
        if( _isGles ) _app.vibrate(pattern)
        else if( _isWebView )  prompt( "#", "App.Vibrate("+pattern );
    }
    
	this.Play = function() { this.Animate( OnAnimate ) }
	this.Pause = function() { this.Animate( null ) }
	this.Reload = function() { if( _isWebView ) prompt("#","wgl:reload"); else document.location.reload() }
	this.IsPaused = function() { return (_cbAnimate==null); }
	
	//Return time since last gfx.Pause() or gfx.Play()
	this.GetTime = function() { return new Date().getTime() -_anim_ts }
	
    //Provide animation func with time diff params.
	this.Animate = function( callback )
	{
	    function _animate() 
	    {
	       if( _phys ) _phys.Step()
		   
    	   if(_cbAnimate) 
		   { 
    	       var t = new Date().getTime(); 
			   
			   if( _isGles ) {
					if( _touchDir && (_touchDir != _lastTouchDir || self.keyState != _lastKeyState) ) 
						OnControl( _touchDir, _touchX, _touchY, self.keyState, self.keyDown );
					_lastTouchDir = _touchDir;
					_lastKeyState = self.keyState;
				}
    		
    	       if( _cbAnimate ) { 
				   _cbAnimate( t-_anim_ts, t-_anim_td );  
				   _anim_td = t; 
				   self.Render();
				   requestAnimationFrame(_animate);
				}
    	   }
		   //Hack to stop flicker (todo: pause renderer)
		   else gfx.renderer.render( gfx.stage ) 
    	}
		_cbAnimate = callback;
		_anim_ts = _anim_td = new Date().getTime();
		requestAnimationFrame( _animate ); 
	}
	
	this.AddPhysics = function( gravity, accuracy, sleep ) {
	    if( !_phys ) _phys = new Physics();
	    _phys.Init( gravity, accuracy, sleep );
		_phys.SetOnCollide( OnCollide )
	}
	
	this.EnablePhysics = function( enabled ) { _phys.SetEnabled( enabled ) }
	this.SetOnCollide = function( callback ) { _phys.SetOnCollide( callback ) }
	
	//Enclose an area with a physics fence.
	this.Enclose = function( groupId, options, density, bounce, friction, offset )
	{
	    if( options ) options = options.toLowerCase();
		else options = ""
		
		if( offset==null ) offset = 0
	    
	    if( options.indexOf("left")>-1 ) {
            var left = gfx.CreateRectangle( 0.01, 1, null, null, null, null, "enclosure" );
            gfx.AddGraphic( left, -0.01-offset, 0 )
			left.SetPhysics( groupId, "fixed", density, bounce, friction );
	    }
	    if( options.indexOf("right")>-1 ) {
            var left = gfx.CreateRectangle( 0.01, 1, null, null, null, null, "enclosure" );
            gfx.AddGraphic( left, 1+offset, 0 )
			left.SetPhysics( groupId, "fixed", density, bounce, friction );
	    }
	    if( options.indexOf("bottom")>-1 ) {
            var bottom = gfx.CreateRectangle( 1, 0.01, null, null, null, null, "enclosure" );
            gfx.AddGraphic( bottom, 0, 1+offset )
			bottom.SetPhysics( groupId, "fixed", density, bounce, friction );
	    }
	    if( options.indexOf("top")>-1 ) {
            var top = gfx.CreateRectangle( 1, 0.01, null, null, null, null, "enclosure" );
            gfx.AddGraphic( top, 0, -0.01-offset )
			top.SetPhysics( groupId, "fixed", density, bounce, friction );
	    }
	}
	
    this.SetBackColor = function( col ) {
        self.stage.setBackgroundColor( col );
    }
    
    //this.GetMatrix = function() { return new Matrix() } 
   
    function Sprite()
    {
        var _this = this; this.visible=true; this.added = false;
        this.x=0,this.y=0,this.width=0,this.height=0,this.alpha=1,this.sprite=null;
        this.angle=0,this.pivotX=0.5,this.pivotY=0.5;
		this.scaleX=1,this.scaleY=1; this.aspect=1;
                
        this.Update = function() 
        { 
			//Todo:  try using set/get props on prototype to see if slows down on bunnies.js
			_this.sprite.visible = _this.visible;
			_this.sprite.position.x = (_this.x + _this.width*_this.pivotX) * _ww; 
            _this.sprite.position.y = (_this.y + _this.height*_this.pivotY ) * _wh;
			
			_this.sprite.anchor.x = _this.pivotX;
			_this.sprite.anchor.y = _this.pivotY;
			
			_this.sprite.rotation = _this.angle * Math.PI * 2;
            
			//Note: trimmed sprite sheets have different widths for each frame so we have 
			//to use scaling instead of setting width/height (might be able to fix this later)
            //if( !_this.sprite.texture.trim ) {
				_this.sprite.setWidth( _this.width * _ww );
				_this.sprite.setHeight( _this.height * _wh );
			//}
			_this.sprite.alpha = _this.alpha;
        }
		
		/* Don't use. use SetSize instead (this method causes too much complication)
		this.Scale = function( sx,sy ) 
		{ 
			_this.scaleX = sx; _this.scaleY = sy
			
            if( !_this.isAtlas ) { if(sx!=null) _this.width *= sx; if( sy!=null ) _this.height *= sy }
            else { if(sx!=null) _this.sprite.scale.x = sx; if(sy!=null) _this.sprite.scale.y = sy }
        }
        */
		
		this.SetSize = function( w, h ) 
		{
			if( w!=null && h!=null ) {
				_this.width = w; _this.height = h;
			}
			else if( w==null && h==null ) {
			    //This ensures sprites are same relative size on all screens.
			    var aspect = _this.sprite.getWidth() / _this.sprite.getHeight();
				_this.width = 0.001 * _this.sprite.getWidth(); //_this.sprite.getWidth()/_ww; 
				_this.height = (_this.width/aspect) * _ww/_wh; //_this.sprite.getHeight()/_wh; 
			}
			else {
				var aspect = _this.sprite.getWidth() / _this.sprite.getHeight();
				if( w==null ) { _this.width = h * aspect / _asp; _this.height = h; }
				else if( h==null ) { _this.width = w; _this.height = _asp * w / aspect; }
			}
			_this.aspect = _this.sprite.width / _this.sprite.height;
		}
		
		this.SetTexture = function( tx ) { _this.sprite.setTexture(tx) }
		
		this.SetTween = function( target,duration,type,repeat,yoyo,callback ) { 
            _Tween.apply( this, [target,duration,type,repeat,yoyo,callback] ); 
		}
		
		this.Tween = function( target,duration,type,repeat,yoyo,callback ) { 
            _Tween.apply( this, [target,duration,type,repeat,yoyo,callback] ); 
			_this.PlayTween();
		}
		
		this.SetPlaySpeed = function( speed ) { _this.sprite.animationSpeed = speed }
		this.SetLoop = function( loop ) { _this.sprite.loop = loop }
		this.Goto = function( frame ) { if( frame!=null) _this.sprite.gotoAndStop(frame); else _this.sprite.stop() }
		this.Stop = function() { _this.sprite.stop() }
		this.StopAt = function( frame ) { _this.sprite.stopAt( frame ) }
		this.SetRange = function( firstFrame, lastFrame, loop, play, speed ) { _this.sprite.setRange( firstFrame, lastFrame, loop, play, speed ) }
		this.PlayRange = function( firstFrame, lastFrame, speed, loop ) { _this.sprite.setRange( firstFrame, lastFrame, loop, true, speed ) }
		this.PlayTo = function( frame ) { _this.sprite.playTo( frame ) }
		this.GetFrame = function() { return _this.sprite.currentFrame }
		
		this.Play = function( startFrame, speed, loop ) 
		{ 
			if( speed!=null ) _this.sprite.animationSpeed = speed
			if( loop!=null ) _this.sprite.loop = loop; 
			if( startFrame!=null) _this.sprite.gotoAndPlay(startFrame); 
			else _this.sprite.play() 
		}
		
		this.SetSpriteSheet = function( sheet )
		{
			//Do nothing if already added.
			if( _this.sprite==sheet.sprite ) return
			
			//Remove old sprite from scene.
			var playing = _this.sprite.playing
			if( playing ) _this.sprite.stop()
			if( _this.added ) gfx.stage.removeChild( _this.sprite )
			//_this.added = false
			
			//Add new sprite sheet to scene
			if( !sheet.added ) gfx.stage.addChild( sheet.sprite );
			sheet.added = true
			
			//Swap sprites, update posn (and resume playing if req)
			_this.sprite = sheet.sprite
			_this.Update()
			if( playing ) _this.Play()
		}
		
		this.Contains = function( x, y ) {
			if( x > _this.x && x < _this.x + _this.width 
					&& y > _this.y && y < _this.y + _this.height ) return true
			else return false
		}
		
		this.Flip = function( horiz, vert )
		{
			var mtx = new Matrix()
			mtx.Scale( horiz?-1:1, vert?-1:1 )
			_this.sprite.userTransform = mtx.mtx
		}
    }
        
    this.CreateSprite = function( file, group, callback )
    {
		//Create sprite object and add to object list.
        var sprite = new Sprite();
		self.objects.push( sprite );
       
	    //Add to physics if required.
        if( _phys ) _phys.Add( sprite );
			
		//Check file type.
		var isTexture = (typeof file=="object"); 
		sprite.isStrip = !isTexture ? file.toLowerCase().indexOf(".")==-1 : false
        sprite.isAtlas = !isTexture ? (sprite.isStrip || file.toLowerCase().indexOf(".json")>-1 ) : false
		
		//Fix sys paths for browsers.
		if( !isTexture ) file = _fixFilePath( file );
		
        var onLoaded = function() 
        {
            sprite.added = false;
            
            if( sprite.isAtlas ) 
			{
                var textures = []
                var frames = sprite.loader.json.frames
				var name = sprite.loader.json.meta.image.replace(".png","") 
                for( var i in frames ) textures.push(PIXI.Texture.fromFrame(name+i))
                sprite.sprite = new PIXI.MovieClip(textures);
				sprite.sprite.animationSpeed = 0.5
            }
            else {
                sprite.texture = isTexture ? file : PIXI.TextureCache[file];
                sprite.sprite = new PIXI.Sprite(sprite.texture);
            }
            sprite.sprite.anchor.x = sprite.sprite.anchor.y = 0.5; //sprite.sprite.alpha = 0.5;
            sprite.sprite.position.x = sprite.sprite.getWidth()/2;
            sprite.sprite.position.y = sprite.sprite.getHeight()/2;
            sprite.group = group;
			sprite.data = {}
            
            // Object.defineProperty SERIOUSLY SLOWS THINGS DOWN!!!  move to above Sprite() object.
            //Add x,y,width,height props etc.
            /*
            Object.defineProperty(sprite, 'pivotX', {
                get: function() { return sprite.sprite.anchor.x },
                set: function(value) { sprite.sprite.anchor.x = value }
            });
             Object.defineProperty(sprite, 'pivotY', {
                get: function() { return sprite.sprite.anchor.y },
                set: function(value) { sprite.sprite.anchor.y = value }
            });
            
            Object.defineProperty(sprite, 'y', {
                get: function() { return (sprite.sprite.y-sprite.sprite.height*sprite.sprite.anchor.y)/self.height },
                set: function(value) { sprite.sprite.y = value*self.height+sprite.sprite.height*sprite.sprite.anchor.y }
            });
            Object.defineProperty(sprite, 'x', {
                get: function() { return (sprite.sprite.x-sprite.sprite.width*sprite.sprite.anchor.x)/self.width },
                set: function(value) { sprite.sprite.x = value*self.width+sprite.sprite.width*sprite.sprite.anchor.x }
            });
            Object.defineProperty(sprite, 'width', {
                get: function() { return sprite.sprite.width/self.width },
                set: function(value) { sprite.sprite.width = value*self.width }
            });
            Object.defineProperty(sprite, 'height', {
                get: function() { return sprite.sprite.height/self.height },
                set: function(value) { sprite.sprite.height = value*self.height }
            }); 
            Object.defineProperty(sprite, 'angle', {
                get: function() { return sprite.sprite.rotation },
                set: function(value) { sprite.sprite.rotation = value }
            });
            Object.defineProperty(sprite, 'scaleX', {
                get: function() { return sprite.sprite.scale.x },
                set: function(value) { sprite.sprite.scale.x = value }
            });
            Object.defineProperty(sprite, 'scaleY', {
                get: function() { return sprite.sprite.scale.y },
                set: function(value) { sprite.sprite.scale.y = value }
            });
            */
            
            sprite.SetMatrix = function( mtx ) { sprite.sprite.userTransform = mtx.mtx }
        
            if( callback ) setTimeout( callback );
        };
        
        if( sprite.isAtlas ) 
		{
            sprite.loader = new PIXI.SpriteSheetLoader(file);
            sprite.loader.onLoaded = onLoaded;
            if( sprite.isStrip ) { 
				var json = self.GenPixiJson( file )
				sprite.loader.load( json );
			}
			else sprite.loader.load(  );
        }
        else if( !isTexture && !PIXI.TextureCache[file] ) 
        {
            var loader = new PIXI.ImageLoader(file);
            loader.onLoaded = onLoaded;
            loader.load();
        }
        else onLoaded()
        
        return sprite;
    }
    
	//Create a sprite sheet in memory (PIXI movie clip)
	this.CreateSpriteSheet = function( file, callback )
    {
        var obj = {}; 
		
		//Check file type.
		//var isTexture = (typeof file=="object"); 
		var isStrip = file.toLowerCase().indexOf(".")==-1
        //var isAtlas = (isStrip || file.toLowerCase().indexOf(".json")>-1 )
		
		//Fix sys paths for browsers.
		file = _fixFilePath( file );
		
        var onLoaded = function() 
        {
			var textures = []
			var frames = obj.loader.json.frames
			var name = obj.loader.json.meta.image.replace(".png","") 
			for( var i in frames ) textures.push(PIXI.Texture.fromFrame(name+i))
			obj.sprite = new PIXI.MovieClip(textures);
			obj.sprite.animationSpeed = 0.5
           
            obj.sprite.anchor.x = obj.sprite.anchor.y = 0.5; //sprite.sprite.alpha = 0.5;
            obj.sprite.position.x = obj.sprite.getWidth()/2;
            obj.sprite.position.y = obj.sprite.getHeight()/2;
			obj.data = {}
            
            if( callback ) setTimeout( callback );
        };
        
        //Load spritesheet.
		obj.loader = new PIXI.SpriteSheetLoader(file);
		obj.loader.onLoaded = onLoaded;
		if( isStrip ) { 
			var json = self.GenPixiJson( file )
			obj.loader.load( json );
		}
		else obj.loader.load(  );
        
		//Add object to list and return it.
		//self.objects.push( obj );
        return obj;
    }
	
	//Generate pixi texture atlas from info in a file name.
	this.GenPixiJson = function( path ) 
	{
		//Extract sprite sheet info from file name
		var inf = path.substr(path.lastIndexOf("_")+1)
		var vals = inf.split("x")
		var w = parseInt( vals[0] )
		var h = parseInt( vals[1] )
		var scx = parseInt( vals[2] )
		var scy = 1; if( vals[3] ) scy = parseInt( vals[3] )
		
		//Check info.
		if(!path) throw "no source path specified";
		if(scx == 0) throw "zero sprite count width";
		if(scy == 0) throw "zero sprite count height";
		if(!scx) throw "no sprite count width specified";
		if(!scy) throw "no sprite count height specified";
		
		//Build json data.
		var p;
		var name = path.slice(path.lastIndexOf("/")+1)+ ".png";
		var title = name.slice(0,name.lastIndexOf("_")+1);
		
		var x, y,
		sw = w / scx,
		sh = h / scy,
		fw = Math.floor(sw),
		fh = Math.floor(sh),
		
		json = {
			frames: {},
			meta: {
				image: name,
				format: "RGBA8888",
				size: { w: w, h: h },
				scale: "1"
			}
		};
			
		for(y = 0; y < scy; y++ ) 
		{
			for(x = 0; x < scx; x++)
			{
				json.frames[ title + x.toString() + "_" + y.toString()] = 
				{
					frame: {
						x:Math.floor(x * sw), 
						y:Math.floor(y * sh), 
						w:fw, 
						h:fh
					},
					rotated: false,
					trimmed: false,
					sourceSize: {w:fw, h:fh}
				}
			}
		}
		return JSON.stringify( json );
	}

    //Add sprite to scene,
    this.AddSprite = function( sprite, x, y, w, h, angle, alpha )
    {
		if( sprite.sprite ) _AddSpriteToParent( self.stage, sprite, x, y, w, h, angle, alpha )
		else if( !sprite.added ) self.stage.addChild( sprite )
		sprite.added = true;
		//if( sprite.EnablePhysics ) sprite.EnablePhysics( true )
    }
	
	//Remove a sprite from the scene.
	this.RemoveSprite = function( sprite ) 
	{
		if( sprite.added ) self.stage.removeChild( sprite.sprite )
		sprite.added = false
		//if( sprite.EnablePhysics ) sprite.EnablePhysics( false )
		
		//setTimeout or we cant destroy body cos it's locked
		//setTimeout( function(){ 
			if( sprite.RemovePhysics ) sprite.RemovePhysics() 
		//}, 0 )
	}
	
    //Add sprite to canvas or batch.
    var _AddSpriteToParent = function( parent, sprite, x, y, w, h, angle, alpha )
    {
        if( !sprite.added ) parent.addChild( sprite.sprite );
        
		sprite.SetSize( w, h )
		/*
		if( w!=null && h!=null ) {
			sprite.width = w; sprite.height = h;
		}
		else if( w==null && h==null ) {
			sprite.width = sprite.sprite.getWidth()/_ww; 
			sprite.height = sprite.sprite.getHeight()/_wh; 
		}
		else {
			var aspect = sprite.sprite.getWidth() / sprite.sprite.getHeight();
			if( w==null ) { sprite.width = h / _asp; sprite.height = h; }
			else if( h==null ) { sprite.width = w; sprite.height = w * _asp; }
		}*/
			
        if( x!=null )  sprite.x = x; //sprite.sprite.x = x * _ww }
        if( y!=null )  sprite.y = y; //sprite.sprite.y = y * _wh }
        
		//Default anchor to 0.5 so rotations are central.
        //sprite.sprite.anchor.x = 0.5; 
        //sprite.sprite.anchor.y = 0.5;
        if( angle!=null ) sprite.angle = angle;
		if( alpha!=null ) sprite.alpha = alpha;
        
		//Update underlying pixi sprite with our changes.
        sprite.Update();
    }
	
	//Create a background tiled and moveable.
	//(image should be tileable in both directions)
	this.CreateBackground = function( file, options )
	{
		if( options ) options = options.toLowerCase(); 
		else options = ""
		
		var obj = {}; 
		
		//Fix sys paths for browsers.
		file = _fixFilePath( file );
		
		var onLoaded = function() 
        {
			obj.texture = PIXI.TextureCache[file];
			obj.sprite = new PIXI.TilingSprite(obj.texture, _ww, _wh);
			if( options.indexOf("stretch")>-1 ) 
				obj.sprite.tileScale = new PIXI.Point( _ww/obj.sprite.getWidth(), _wh/obj.sprite.getHeight() )
		}
		
		var loader = new PIXI.ImageLoader( file );
        loader.onLoaded = onLoaded;
        loader.load();
		
		obj.Scroll = function( x, y ) { obj.sprite.tilePosition.x += x; obj.sprite.tilePosition.y += y }
			
		return obj
	}
	
	//Add background to screen.
	this.AddBackground = function( obj ) { self.stage.addChild( obj.sprite ) }
	
	//Remove background from screen.
	this.RemoveBackground = function( obj ) { self.stage.removeChild( obj.sprite ) }
	
	//Create a bitmap font.
	this.CreateText = function( text, fontSize, fontFile, align, callback )
	{
		if( !fontSize ) fontSize = 0.1;
        var obj = { file:fontFile, fontSize:fontSize, align:align }
		obj.visible = true;
        obj.width = 0; obj.height = 0;
		obj.angle = 0; obj.alpha = 1;
		obj.pivotX = 0.5; obj.pivotY = 0.5;  
		obj.scaleX=1,obj.scaleY=1;
        
        var loader = new PIXI.AssetLoader([fontFile]);
		loader.onComplete = function() 
		{ 
            obj.loader = loader;
			
			var name = fontFile.slice(fontFile.lastIndexOf("/")+1).replace(".xml","");
			var bmpText = new PIXI.BitmapText( text.toString(), { font: Math.round(fontSize*_wh)+"px "+name, align: align });
            //bmpText.position.x = 20;// - bmpText.textWidth - 20;
            //bmpText.position.y = 20;
			obj.bitmapText = bmpText;
			obj.width = bmpText.textWidth/_ww;
			obj.height = bmpText.textHeight/_wh;
			
            if( callback ) callback()
        };
		loader.load();
		
		obj.Update = function() 
		{ 
			obj.bitmapText.visible = obj.visible;
			obj.bitmapText.position.x = obj.x * _ww + obj.bitmapText.textWidth * obj.pivotX;
            obj.bitmapText.position.y = obj.y * _wh + obj.bitmapText.textHeight * obj.pivotY;
			obj.bitmapText.pivot.x = obj.pivotX * obj.bitmapText.textWidth;
			obj.bitmapText.pivot.y = obj.pivotY * obj.bitmapText.textHeight;
			//obj.bitmapText.scale.x = (obj.width * _ww/obj.bitmapText.textWidth);
			//obj.bitmapText.scale.y = (obj.height * _wh/obj.bitmapText.textHeight);
			
			obj.bitmapText.rotation = obj.angle * Math.PI * -2 //*_asp;
			obj.bitmapText.alpha = obj.alpha;
		}
		
		obj.SetMatrix = function( mtx ) { obj.bitmapText.userTransform = mtx.mtx }
		
		/*obj.Scale = function( sx,sy ) 
		{ 
			obj.scaleX = sx; obj.scaleY = sy
			if(sx!=null) { obj.width *= sx; obj.pivotX *= sx }
			if(sy!=null) { obj.height *=sy; obj.pivotY *= sy }
		}*/
		
		obj.Contains = function( x, y ) {
			if( x > obj.x && x < obj.x + obj.width 
					&& y > obj.y && y < obj.y + obj.height ) return true
			else return false
		}
		
		//Add to object list and physics if required.
		self.objects.push( obj );
        if( _phys ) _phys.Add( obj );
		
        return obj;
	}
   
    //Add text object to the canvas.
    this.AddText = function( obj, x, y, angle, alpha )
    {
        obj.x = x; obj.y = y;
        if( !obj.added ) self.stage.addChild( obj.bitmapText );
		obj.added = true;
        
        if( x!=null ) obj.bitmapText.position.x = x;
        if( y!=null ) obj.bitmapText.position.y = y; 
        if( angle!=null ) obj.angle = angle;
		if( alpha!=null ) obj.alpha = alpha;
		//if( width!=null && obj.width!=null ) obj.width = width;
		//if( height!=null && obj.height!=null ) obj.height = height;
        
		//Give the text tweening powers.
		obj.SetTween = function( target,duration,type,repeat,yoyo,callback ) { 
            _Tween.apply( obj, [target,duration,type,repeat,yoyo,callback] ); 
		}
		
		obj.Tween = function( target,duration,type,repeat,yoyo,callback ) { 
            _Tween.apply( obj, [target,duration,type,repeat,yoyo,callback] );  
			obj.PlayTween();
		}
		
		obj.SetText = function( txt ) { obj.bitmapText.setText( txt.toString() ) }
		
		//Update underlying pixi object with our changes.
        obj.Update();
    }
    //Add text to screen.
	//this.AddText = function( text ) { self.stage.addChild(text.bitmapText) }
	
	//Remove Text from screen.
	this.RemoveText = function( obj ) 
	{ 
		if( obj.added ) self.stage.removeChild( obj.bitmapText ); 
		obj.added = false 
		if( obj.RemovePhysics ) obj.RemovePhysics() 
	}
	
	//Todo: create a seperate Rectangle object?
    this.CreateRectangle = function( width, height, color, lineWidth, lineColor, lineAlpha, group )
    {
        var obj = {}; 
        var graphic = new PIXI.Graphics();
        graphic.lineStyle( lineWidth!=null?lineWidth:0, lineColor?lineColor:0, lineAlpha!=null?lineAlpha:1 );
        if( color!=null ) graphic.beginFill( color );
		graphic.drawRect(-(width/2)*_ww, -(height/2)*_wh, width*_ww, height*_wh);
        if( color!=null ) graphic.endFill();
		obj.group = group;
		obj.data = {}
		
        obj.graphic = graphic; obj.visible = true;
        obj.width = width; obj.height = height;
		obj.angle = 0; obj.alpha = 1;
		obj.pivotX = 0.5; obj.pivotY = 0.5;  
		//obj.pivotX = 0; obj.pivotY = 0; 
		obj.scaleX=1,obj.scaleY=1;
        
        //Add x,y props and methods etc.
		obj.Update = function() 
		{ 
			obj.graphic.visible = obj.visible;
			obj.graphic.position.x = ( obj.x + width * obj.pivotX ) * _ww;
            obj.graphic.position.y = ( obj.y + height * obj.pivotY ) * _wh;
			obj.graphic.scale.x = (obj.width/width);
			obj.graphic.scale.y = (obj.height/height);
			obj.graphic.pivot.x = obj.pivotX * obj.width;
			obj.graphic.pivot.y = obj.pivotY * obj.height;
			obj.graphic.rotation = obj.angle * Math.PI * -2 //*_asp;
			obj.graphic.alpha = obj.alpha;
		}
		
        obj.SetMatrix = function( mtx ) { graphic.userTransform = mtx.mtx }
		
		/*obj.Scale = function( sx,sy ) 
		{ 
			obj.scaleX = sx; obj.scaleY = sy
			if(sx!=null) { obj.width *= sx; obj.pivotX *= sx }
			if(sy!=null) { obj.height *=sy; obj.pivotY *= sy }
		}*/
		
		obj.Contains = function( x, y ) {
			if( x > obj.x && x < obj.x + obj.width 
					&& y > obj.y && y < obj.y + obj.height ) return true
			else return false
		}
		
        //Add to object list and physics if required.
		self.objects.push( obj );
        if( _phys ) _phys.Add( obj );
        
        return obj;
    }
	
	this.CreateEllipse = function( width, height, color, lineWidth, lineColor, lineAlpha, group )
    {
        var obj = {}; 
        var graphic = new PIXI.Graphics();
        graphic.lineStyle( lineWidth!=null?lineWidth:0, lineColor?lineColor:0, lineAlpha!=null?lineAlpha:1 );
        if( color!=null ) graphic.beginFill( color );
		graphic.drawEllipse(0, 0, width*_ww, height*_wh);
        if( color!=null ) graphic.endFill();
		obj.group = group;
		obj.data = {}
		
        obj.graphic = graphic; obj.visible=true;
        obj.width = width; obj.height = height;
		obj.angle = 0; obj.alpha = 1;
		obj.pivotX = 0.5; obj.pivotY = 0.5;  
		obj.scaleX=1,obj.scaleY=1;
        
        //Add x,y props and methods etc.
		obj.Update = function() 
		{ 
			obj.graphic.visible = obj.visible;
			obj.graphic.position.x = ( obj.x + width * obj.pivotX ) * _ww;
            obj.graphic.position.y = ( obj.y + height * obj.pivotY ) * _wh;
			obj.graphic.scale.x = (obj.width/width/2);
			obj.graphic.scale.y = (obj.height/height/2);
			obj.graphic.pivot.x = obj.pivotX * width;
			obj.graphic.pivot.y = obj.pivotY * height;
			obj.graphic.rotation = obj.angle * Math.PI * -2// *_asp;
			obj.graphic.alpha = obj.alpha;
		}
		
        obj.SetMatrix = function( mtx ) { graphic.userTransform = mtx.mtx }
		
		/*obj.Scale = function( sx,sy ) 
		{ 
			obj.scaleX = sx; obj.scaleY = sy
			if(sx!=null) { obj.width *= sx; obj.pivotX *= sx }
			if(sy!=null) { obj.height *=sy; obj.pivotY *= sy }
		}*/
		
		obj.Contains = function( x, y ) {
			if( x > obj.x && x < obj.x + obj.width 
					&& y > obj.y && y < obj.y + obj.height ) return true
			else return false
		}
        
        //Add to object list and physics if required.
		self.objects.push( obj );
        if( _phys ) _phys.Add( obj );
        
        return obj;
    }
	
	this.CreateCircle = function( width, color, lineWidth, lineColor, lineAlpha )
    {
        return this.CreateEllipse( width, width*_asp, color, lineWidth, lineColor, lineAlpha )
    }
	
	//Create a polygon shape.
	//Note: Physics not currently supported on polygons.
	this.CreatePolygon = function( points, pivotX, pivotY, color, lineWidth, lineColor, lineAlpha, group )
    {
        var obj = {}; 
        var graphic = new PIXI.Graphics();
        graphic.lineStyle( lineWidth!=null?lineWidth:0, lineColor?lineColor:0, lineAlpha!=null?lineAlpha:1 );
        if( color!=null ) graphic.beginFill( color );
		obj.group = group;
		obj.data = {}
		
		//Scale points and draw polygon.
		var x1 = points[0], y1 = points[1];
		pivotX -= x1;  pivotY -= y1;
		//var px = pivotX-x1, py = pivotY-y1;
		//var px = pivotX, py = pivotY;
		for( var i=0; i<points.length-1; i+=2 ) 
		{ 
			points[i] -= (x1+pivotX); 
			points[i+1] -= (y1+pivotY); //<-- shift poly to (0,0)-pivot
			points[i] *= _ww; points[i+1] *= _wh; 
			//if( pivotX ) points[i] -= ((points[0]));
			//if( pivotY ) points[i+1] -= ((points[1]));
		}
		graphic.drawPolygon( points );
        //graphic.drawPolygon( [-32, 64, 32, 64, 0, 0] );
		
        if( color!=null ) graphic.endFill();
        obj.graphic = graphic; obj.angle = 0; obj.visible = true;
		obj.pivotX = pivotX; obj.pivotY = pivotY; obj.alpha = 1;
		obj.scaleX=1,obj.scaleY=1; obj.width=1,obj.height=1;
        
        //Add x,y props and methods etc.
		obj.Update = function() 
		{ 
			obj.graphic.visible = obj.visible;
			obj.graphic.position.x = ( obj.x + obj.pivotX ) * _ww;
            obj.graphic.position.y = ( obj.y + obj.pivotY ) * _wh;
			obj.graphic.pivot.x = obj.pivotX;
			obj.graphic.pivot.y = obj.pivotY;
			
			obj.graphic.scale.x = obj.width;
			obj.graphic.scale.y = obj.height;
			
			//obj.graphic.pivot.x = obj.pivotX * _ww;
			//obj.graphic.pivot.y = obj.pivotY * _wh;
			//obj.graphic.x = ( obj.x + obj.pivotX ) * _ww;
            //obj.graphic.y = ( obj.y + obj.pivotY ) * _wh;
					
			//obj.graphic.rotation = obj.angle * 1/_asp * Math.PI * -2;
			obj.graphic.rotation = obj.angle * Math.PI * -2// *_asp;
			obj.graphic.alpha = obj.alpha;
		}
		
        obj.SetMatrix = function( mtx ) { graphic.userTransform = mtx.mtx }
		
		/*obj.Scale = function( sx,sy ) 
		{ 
			//Note: no width/height vals avail for polygon
			obj.scaleX = sx; obj.scaleY = sy
			if(sx!=null) obj.graphic.scale.x = sx; 
			if(sy!=null) obj.graphic.scale.y = sy 
		}*/
		
		//Todo: this won't work need to getbounds
		obj.Contains = function( x, y ) {
			if( x > obj.x && x < obj.x + obj.width 
					&& y > obj.y && y < obj.y + obj.height ) return true
			else return false
		}
		
        //Add to object list and physics if required.
		self.objects.push( obj );
        if( _phys ) _phys.Add( obj );
        
        return obj;
    }
	
    //Add an object to the canvas.
    this.AddGraphic = function( obj, x, y, w, h, angle, alpha )
    {
        obj.x = x; obj.y = y;
        if( !obj.added ) self.stage.addChild( obj.graphic );
		obj.added = true;
        
        if( x!=null ) obj.graphic.position.x = x;
        if( y!=null ) obj.graphic.position.y = y; 
        if( angle!=null ) obj.angle = angle;
		if( alpha!=null ) obj.alpha = alpha;
		if( w!=null && obj.width!=null ) obj.width = w;
		if( h!=null && obj.height!=null ) obj.height = h;
        
		//Give the graphic tweening powers.
		obj.SetTween = function( target,duration,type,repeat,yoyo,callback ) { 
            _Tween.apply( obj, [target,duration,type,repeat,yoyo,callback] ); 
		}
		
		obj.SetTween = function( target,duration,type,repeat,yoyo,callback ) { 
            _Tween.apply( obj, [target,duration,type,repeat,yoyo,callback] );  
			obj.PlayTween();
		}
		
		//Update underlying pixi object with our changes.
        obj.Update();
    }
	
	//Remove graphical object from screen.
	this.RemoveGraphic = function( obj ) 
	{ 
		if( obj.added ) self.stage.removeChild( obj.graphic ); 
		obj.added = false 
		if( obj.RemovePhysics ) obj.RemovePhysics() 
	}
    
    //Create a batch container for super fast group rendering.
    this.CreateBatch = function() 
    { 
        var batch = new PIXI.SpriteBatch(); 
        
        batch.AddChild = function( child ) { batch.addChild( child ) }
        batch.AddSprite = function( sprite, x, y, w, h, angle, alpha ) 
		{
			if( sprite.sprite ) _AddSpriteToParent( batch, sprite, x, y, w, h, angle, alpha )
			else batch.addChild( sprite )
        }
        return batch;
    }
    
    //Add the batch to the scene.
    this.AddBatch = function( batch ) { self.stage.addChild(batch) }
    
    //Support simple/basic sprite objects (lighter and faster).
    this.AddBasicSprite = function( sprite ) { self.stage.addChild(sprite) }
	this.CreateBasicSprite = function( texture ) { return new PIXI.Sprite(texture) }
	
	//z order methods.
	this.GetOrder = function( object ) { return self.stage.children.indexOf( object.sprite ? object.sprite : object.graphic ) }
	this.SetOrder = function( object, order ) { self.stage.addChildAt( object.sprite ? object.sprite : object.graphic, order ) }
	this.SwapOrder = function( object1, object2 ) { 
		self.stage.swapChildren( object1.sprite ? object1.sprite : object1.graphic, object2.sprite ? object2.sprite : object2.graphic ) 
	}
	
    
    this.CreateTexture = function( file ) 
    { 
		//Fix sys paths for browsers.
		file = _fixFilePath( file );
		
		return new PIXI.Texture.fromImage( file ); 
	}
	
	/*
	//Load a texture map / sprite sheet.
	//is this used still??
	this.LoadTextureAtlas = function( file, callback )
	{
        var atlas = { file:file }
        
        //Fix sys paths for browsers.
		file = _fixFilePath( file );
		//var file = file.replace( ".png",".json" )
        
		//var loader = new PIXI.AssetLoader([file]);
        var loader = new PIXI.SpriteSheetLoader(file);
		//loader.onComplete = function(){ 
        loader.onLoaded = function() { 
            atlas.loader = loader
            if( callback ) callback()
        };
		loader.load();
        return atlas
	}
	*/
	

	
    //Render all objects.
    this.Render = function()
    {
		for( var o in self.objects ) 
		{ 
			var obj = self.objects[o]
			
			//Tween objects if required.
			if( obj.tweening ) obj.StepTween()
			
			//Copy any user x,y,w,h property changes to PIXI world.
			if( obj.added ) obj.Update();
		}
		
        self.renderer.render( self.stage );
    }
    
    this.IsOverlap = function( obj1, obj2, depth )
    {
        depth = (depth ? depth : 0);
        var x1 = obj1.x; var y1 = obj1.y; var w1 = obj1.width; var h1 = obj1.height;
        var x2 = obj2.x; var y2 = obj2.y; var w2 = obj2.width; var h2 = obj2.height;
        if( x2 < x1+w1-depth && x2+w2 > x1+depth && y2+h2 > y1+depth && y2 < y1+h1-depth )
            return true;
        else
            return false;
    }
	
    //Set callback for touch down.
	this.SetOnTouchDown = function( callback ) { _onTouchDown = callback }
	
	//Set callback for touch move.
	this.SetOnTouchMove = function( callback ) 
	{
		/*
		if( !_onTouchMove ) document.addEventListener( _isGles ?"touchmove":"mousemove", function(ev){
		    _touchX = _isGles  ? ev.touches[0].screenX/_ww : ev.offsetX/_ww;
	        _touchY = _isGles  ? ev.touches[0].screenY/_wh : ev.offsetY/_wh;
			_onTouchMove( _touchX, _touchY );
		}, false);
		*/
		_onTouchMove = callback;
	}
	
	//Set callback for touch up.
	this.SetOnTouchUp = function( callback ) { _onTouchUp = callback }
	
	//Set callbacks for key up/down.
	this.SetOnKeyDown = function( callback ) { _onKeyDown = callback; }
	this.SetOnKeyUp = function( callback ) { _onKeyUp = callback; }
	
	
    this.GetContext = function()
    {
        //return this.ctx;
        return "not supported!";
    }
    
    this.CreateSound = function( file ) 
	{
		//Fix sys paths for browsers.
		file = _fixFilePath( file );
		
		var id = "#" + JGAudio.idx++
        JGAudio.load( id, file );
		
		return new Sound( id, file )
    }
    
    /*this.PlaySound = function( name,loop,gap ) 
	{
        JGAudio.play( name,"main",loop,gap );
    }
    
    this.PauseSound = function( name ) {
        JGAudio.pause( name );
    }
	*/
    
}

//Wrapper class for PIXI matrix.
function Matrix()
{
    var self = this;
    var w = window.innerWidth;
    var h = window.innerHeight;
    
    this.mtx = new PIXI.Matrix();
    this.Translate = function( tx, ty ) { self.mtx.translate( tx*_ww,ty*_wh ) }
    this.Scale = function( sx, sy ) { self.mtx.scale( sx,sy ) }
    this.Rotate = function( angle ) { self.mtx.rotate( angle ) }
    this.Skew = function( skewX, skewY ) { self.mtx.skew( skewX, skewY ) }
    this.Transform = function( tx, ty, pivotX, pivotY, scaleX, scaleY, rotation, skewX, skewY ) {
        self.mtx.setTransform( tx*_ww, ty*_wh, pivotX, pivotY, scaleX, scaleY, rotation, skewX, skewY );
    }
    this.Set = function( a, b, c, d, tx, ty ) { self.mtx.set(a, b, c, d, tx*_ww, ty*_wh) }
}


//---- Physics.js --------------------------------

//Class for enabling physics on other objects.
//(the object must have x,y,width,height properties)
function Physics()
{
    var self = this;
    var _b2Vec2=null, _world=null; _enabled=true;
	var _scale = 10; //units per meter
	var _velScale = 0.8; //velocity scale
	var _gravScale = 5;
    var _gravity = _gravScale*10/_scale, _accuracy=3, _fps=60, _sleep=false;
    this.obs = [];
    
    this.Init = function( gravity, accuracy, sleep )
    {
        if( _isGles ) _script( "/Sys/Libs/Box2d.js" );
	    
        _b2Vec2 = Box2D.Common.Math.b2Vec2
     	,	_b2BodyDef = Box2D.Dynamics.b2BodyDef
     	,	_b2Body = Box2D.Dynamics.b2Body
     	,	_b2FixtureDef = Box2D.Dynamics.b2FixtureDef
     	,	_b2Fixture = Box2D.Dynamics.b2Fixture
     	,	_b2World = Box2D.Dynamics.b2World
     	,	_b2MassData = Box2D.Collision.Shapes.b2MassData
     	,	_b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
     	,	_b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
     	,	_b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
             	
        if( gravity!=null ) _gravity = _gravScale*gravity/_scale;
        if( accuracy!=null ) _accuracy = accuracy;
		if( sleep!=null ) _sleep = sleep;
        
		//Note: we set sleep to false or objects won't slide off tipping platforms.
        _world = new _b2World( new _b2Vec2(0,_gravity), _sleep );
    }
    
    this.SetEnabled = function( enabled ) {  
	    _enabled = enabled;
	}
	
    this.Step = function()
    {
        if( !_enabled ) return;
        
		//Step the physics world.
       _world.Step( 1/_fps, _accuracy*3,_accuracy );
       _world.ClearForces();
        
		//Move the graphics world objects according to physics world.
        for( var o in self.obs )
        {
            var obj = self.obs[o];
            var body = obj.body;
            if( !body ) continue;
            
			//Set graphics object position and angle.
            var p = body.GetPosition();
            //obj.x = p.x / _scale - obj.width/2;
            //obj.y = p.y / _scale - obj.height/2;
			//obj.x = (p.x - obj.width/2) / _scale;
            //obj.y = (p.y - obj.height/2) / _scale * _asp;
			obj.x = p.x/_scale - obj.width/2;
            obj.y = p.y/_scale*_asp - obj.height/2;
			
            obj.angle = body.GetAngle()/(Math.PI*2)// /_asp; //<-- why need /_asp ?????
			
            //not needed cos of loop in render func: if( obj.Update ) obj.Update();
        }
    }
	
    //Add object to world and give it physics methods.
    this.Add = function( obj )
    {
        //Add object to list.
        self.obs.push( obj );
        
        //Add 'SetPhysics' property to source object.
		//type: fixed, moveable, dynamic
		//groups with negative nums don't interact
    	obj.SetPhysics = function( groupId, type, density, bounce, friction, linearDamp, angularDamp )
    	{
            var fixDef = new _b2FixtureDef;
            fixDef.density = density;
            fixDef.friction = friction;
            fixDef.restitution = bounce;
            fixDef.filter.groupIndex = groupId;
            
            //Scale up values to prevent rounding errors.
			if( obj.width==0 ) console.log( "WARNING: physics cannot be set for object with zero width" )
            var w = obj.width*_scale;
            var h = obj.height*_scale/_asp;
			var x = obj.x*_scale + w/2;
            var y = obj.y*_scale/_asp + h/2;
            
            var bodyDef = new _b2BodyDef;
			type = type.toLowerCase();
            bodyDef.type = (type=="fixed" ? _b2Body.b2_staticBody : ( type=="moveable" ? _b2Body.b2_kinematicBody : _b2Body.b2_dynamicBody ));  
            if( linearDamp ) bodyDef.linearDamping = linearDamp;
            if( angularDamp ) bodyDef.angularDamping = angularDamp;
			bodyDef.position.Set( x, y );
			bodyDef.angle = obj.angle * Math.PI * 2
            
			var shape = "box"
			if( shape!=null ) shape = shape.toLowerCase();
            if( shape!=null && shape.indexOf("round")>-1 ) {
				fixDef.shape = new _b2CircleShape;
				fixDef.shape.m_radius = h/2;
			}
			else {
				fixDef.shape = new _b2PolygonShape;
				//console.log( "setbox:" + w/2 + "," + h/2 )
				fixDef.shape.SetAsBox( w/2, h/2 );
			}            
            /*
            else fixDef.shape.SetAsArray([
                new b2Vec2( x, y ),
                new b2Vec2( x+w, y ),
                new b2Vec2( x+w, y+h ),
                new b2Vec2( x, y+h )
                ], 4 );
                */
                
            var body = _world.CreateBody(bodyDef);
            obj.fixture = body.CreateFixture(fixDef);
            //body.SetPosition( new _b2Vec2( 0, 0 ) );
            body._parent = obj;
            obj.body = body;
			obj.fixDef = fixDef;
			
			//Update the position.
			//obj.UpdatePhysics();
    	}
    	
		//Set fixture shape (currently only a single fixture supported)
		obj.SetShape = function( shape, width, height )
		{
			if( width==null ) width = 1
			if( height==null ) height = 1
			
			var shape = shape.toLowerCase();
			var w = obj.width * _scale;
            var h = obj.height * _scale/_asp;
			
			if( obj.fixture ) obj.body.DestroyFixture( obj.fixture );
			
            if( shape.indexOf("round")>-1 ) {
				obj.fixDef.shape = new _b2CircleShape;
				obj.fixDef.shape.m_radius = h*width/2;
			}
			else {
				obj.fixDef.shape = new _b2PolygonShape;
				obj.fixDef.shape.SetAsBox( w*width/2, h*height/2 );
			}            
			obj.fixture = obj.body.CreateFixture( obj.fixDef );
		}
		
    	//Add 'SetVelocity' property to source object.
    	obj.SetVelocity = function( x, y, angular, bodyRelative )
    	{
    	    if( obj.body ) 
    	    {
				if( bodyRelative ) {
					var a = obj.body.GetAngle()// /_asp
					var xr = Math.cos(a)*x - Math.sin(a)*y
					var yr = Math.sin(a)*x + Math.cos(a)*y
					x = xr; y = yr 
				}
        		//if( x!=null && y!=null) 
        		//	obj.body.SetLinearVelocity( new _b2Vec2(x,y*_asp) );
				if( x!=null ) obj.body.m_linearVelocity.x = x * _scale * _velScale
				if( y!=null ) obj.body.m_linearVelocity.y = y * _scale * _velScale
        		if( angular!=null ) obj.body.SetAngularVelocity( angular * Math.PI * 2 );
    	    }
    	    obj.Update();
    	}
		
		//Add 'AddVelocity' property to source object.
    	obj.AddVelocity = function( x, y, angular, bodyRelative )
    	{
    	    if( obj.body && obj.body.m_type != _b2Body.b2_staticBody ) 
    	    {
				obj.body.IsAwake() == false && obj.body.SetAwake(true);
				
				if( bodyRelative ) {
					var a = obj.body.GetAngle() // /_asp
					var xr = Math.cos(a)*x - Math.sin(a)*y
					var yr = Math.sin(a)*x + Math.cos(a)*y
					x = xr; y = yr
				}
        		if( x!=null ) obj.body.m_linearVelocity.x += x * _scale * _velScale
				if( y!=null ) obj.body.m_linearVelocity.y += y * _scale * _velScale
        		if( angular!=null ) obj.body.m_angularVelocity += angular * Math.PI * 2
    	    }
    	    obj.Update();
    	}
    	
		//Get the velocity of the object ( "x", "y", "angular", null)
		obj.GetVelocity = function( component )
		{
			if( obj.body )
			{
				if( component=="x" ) return obj.body.m_linearVelocity.x
				else if( component=="y" ) return obj.body.m_linearVelocity.y
				else if( component=="angular" ) return obj.body.m_angularVelocity
				else { 
					var vx = obj.body.m_linearVelocity.x; var vy = obj.body.m_linearVelocity.y
					return Math.sqrt( vx*vx  + vy*vy )
				}
			}
			else return 0
		}
		
		//Add 'ApplyImpulse' property to source object.
		// dx, dy are offsets from object center (range -1 to +1)
		obj.ApplyImpulse = function( x, y, offsetX, offsetY )
		{
    	    if( obj.body ) 
    	    {
        		if( x!=null && y!=null) 
				{
					var w = obj.width*_scale;
					var h = obj.height*_scale/_asp;
					var fx = obj.x*_scale + w/2 + w * (offsetX ? offsetX : 0)/2;
					var fy = obj.y*_scale/_asp + h/2 + h * (offsetY ? offsetY : 0)/2;
        			obj.body.ApplyImpulse( new _b2Vec2(x/_fps,y/_fps), new _b2Vec2(fx,fy) );
				}
    	    }
    	    obj.Update();
    	}
		
    	//Add 'Update' property to source object.
    	obj.UpdatePhysics = function()
    	{
    	    if( obj.body ) 
    	    {
    	        var w = obj.width*_scale;
                var h = obj.height*_scale/_asp;
                var x = obj.x*_scale + w/2;
                var y = obj.y*_scale/_asp + h/2;
           
    		    obj.body.SetPosition( new _b2Vec2( x, y ) );
				obj.body.SetAngle( obj.angle * Math.PI * 2 ) //* _asp ); //<-- why need _asp ?????
    	    }
    	}
		
		//Disable or enable physics for this object.
		obj.EnablePhysics = function( enable ) 
		{
			if( obj.body ) obj.body.SetActive( enable )
		}
		
		obj.RemovePhysics = function()
		{
			if( obj.body ) {
				_world.DestroyBody( obj.body )
				obj.body = null
			}
		}
    }
    
    //Detect collisions.
    this.SetOnCollide = function( callback )
    {
        var listener = new Box2D.Dynamics.b2ContactListener;
        _world.SetContactListener( listener );
        
        listener.BeginContact = function(contact) 
		{
            //console.log( contact.GetFixtureA().GetBody() );
			var a = contact.GetFixtureA().GetBody()
			var b = contact.GetFixtureB().GetBody()
			if( a.IsActive() && b.IsActive() ) 
			{
				//Sort objects alphabetically by group name
				var aa=a, bb=b;
				if( a._parent.group > b._parent.group ) { aa=b; bb=a }
				
				//setTimeout or we cant destroy body cos it's locked
				setTimeout( function(){ callback( aa._parent, bb._parent ) }, 0 )
			}
        }
        
        listener.EndContact = function(contact) 
		{
            //console.log( contact.GetFixtureA().GetBody() );
            var a = contact.GetFixtureA().GetBody()
			var b = contact.GetFixtureB().GetBody()
			//if( a.IsActive() && b.IsActive() ) callback( a._parent, b._parent );
        }
    }
    
  
}

//--- Twn.js ----------------------------

/*DS: 

	Add tweening to any object (it should have x,y,width,height,angle,scaleX,scaleY props)

	myobj.Tween = function( target,duration,type,repeat,yoyo,callback ) { 
            _Tween.apply( myobj, [target,duration,type,repeat,yoyo,callback] ); 
		}
*/

function _Tween( target, duration, type, repeat, yoyo, callback )
{
    var obj = this;
    var start = { x:obj.x, y:obj.y, width:obj.width, height:obj.height, 
			/*scaleX:obj.scaleX, scaleY:obj.scaleY,*/ angle:obj.angle, alpha:obj.alpha };
    var tween = new TWEEN.Tween(start);
	
	var pause = true;
	//var done = false;
    
    tween.to(target, duration);
    if( repeat ) tween.repeat( repeat );
    if( yoyo ) tween.yoyo( true );
    if( type ) tween.easing( eval("TWEEN.Easing."+type) )
    
    tween.onUpdate(function() 
	{
		//console.log( this.x )
        if( this.x!=null ) obj.x = this.x
		if( this.y!=null ) obj.y = this.y
		
		//var aspect = obj.sprite.getWidth() / obj.sprite.getHeight();
		//alert( aspect )
		if( this.width!=null ) obj.width = this.width; 
		if( this.height!=null ) obj.height = this.height
		//if( this.width!=null && obj.SetSize ) obj.SetSize( this.width, null )
		//if( this.height!=null && obj.SetSize ) obj.SetSize( null, this.height )
		
        //if( (this.width || this.height ) && _this.SetSize ) _this.SetSize( this.w?this.w:null, this.h?this.h:null );
        //if( this.scaleX!=null ) obj.Scale( this.scaleX, null )
		//if( this.scaleY!=null ) obj.Scale( null, this.scaleY )
        if( this.angle!=null ) obj.angle = this.angle;
		if( this.alpha!=null ) obj.alpha = this.alpha;
        //Todo: _this._Tween( this.x, this.y, this.w, this.h, this.rotation );
    });
    tween.onComplete(function() 
	{
        ////clearInterval( tween.timer );
        //cancelAnimationFrame( tween.timer );
		//done = true
		obj.tweening = false
        if( callback ) callback();
    });
	
    obj.StepTween = function() 
	{
		if( pause /*|| done*/ ) return;
	
        //tween.timer = requestAnimationFrame( tween.DoTween );
        tween.update( new Date().valueOf() );
    }
    
	obj.PlayTween = function(){ 
		pause = false; 
		if( !obj.tweening /*&& !done*/ ) obj.StartTween() 
	}
	
	obj.PauseTween = function(){ 
		pause = true 
	}
	
	obj.StartTween = function() 
	{
		tween.start( new Date().valueOf() );
		////tween.timer = setInterval( tween.DoTween, 1000/500 );
		//tween.timer = requestAnimationFrame( tween.DoTween );
		obj.tweening = true
		//done = false
	}
	
	if( !pause ) obj.StartTween();
	
}


//---- gjaudio.js --------------------------------

// Copyright (c) by Boris van Schooten boris@13thmonkey.org
// Released under BSD license. 
// This file is part of gles.js - a lightweight WebGL renderer for Android
// HTML5 function and object emulation

function JGAudio() { }

// false, null -> init
// true,null -> use audio element
// true,nonnull -> use web audio api
JGAudio._inited = false;
JGAudio._context = null;

// Audio elements
JGAudio._soundcache = {};

// mapping from sound name to filename
// or from sound name to audio buffer
JGAudio._sounds = {};

//DS: record last played times.
JGAudio._times = {};

// name of channel if a looping sound was played before it was loaded
// -> play as soon as loaded. 
JGAudio._sounds_queued = {};

JGAudio._init = function() {
	if (JGAudio._inited) return;
	if (window.AudioContext || window.webkitAudioContext) {
		try {
			window.AudioContext=window.AudioContext||window.webkitAudioContext;
			JGAudio._context = new AudioContext();
		} catch (e) {
			// web audio not supported, use audio element
		}
	}
	JGAudio._inited = true;
}

// tries to load mp3 and ogg
JGAudio._loadFile = function(basefilename) {
	var ret=null;
	if ((new Audio()).canPlayType("audio/mpeg;")) {
		ret = new Audio(basefilename/*ds: +".mp3"*/);
	} else if ((new Audio()).canPlayType("audio/ogg;")) {
		ret = new Audio(basefilename/*ds:+".ogg"*/);
	}
	return ret;
}

JGAudio.load = function (name,basefilename) 
{
	JGAudio._init();
	if (JGAudio._context) 
	{
		JGAudio._sounds[name] = "loading";
		var request = new XMLHttpRequest();
		request.open('GET', basefilename/*ds:+".mp3"*/, true);
		request.responseType = 'arraybuffer';
		
		// Decode asynchronously
		request.onload = function() {
			JGAudio._context.decodeAudioData(request.response,
				function(buffer) {
					JGAudio._sounds[name] = buffer;
					if (JGAudio._sounds_queued[name]) {
						JGAudio._sounds_queued[name] = false;
						JGAudio.play(name,JGAudio._sounds_queued[name],true);
					}
				},
				function(error) { }/*onError*/
			);
		}
		request.send();
	} else {
		JGAudio._sounds[name] = basefilename;
		JGAudio._soundcache[name] = JGAudio._loadFile(basefilename);
	}
}

JGAudio.play = function(name,channel,loop,gap) 
{
	if (typeof JGAudio._sounds[name] == "undefined") return;
	
	//DS: Prevent extreme rapid fire of same sound.
	var tlast = JGAudio._times[name];
	var tnow = new Date().getTime();
	if( gap==null ) gap = 100;
    if( tlast && tnow - tlast < gap ) return;
    JGAudio._times[name] = tnow;
        
	if (JGAudio._context)
	{
		if (JGAudio._sounds[name] == "loading") {
			if (loop) {
				JGAudio._sounds_queued[name] = channel;
			}		
		} else 
		{
		    var gainNode = JGAudio._context.createGain();
            gainNode.gain.value = 0.5; 
            gainNode.connect(JGAudio._context.destination);
			var source = JGAudio._context.createBufferSource();
			source.buffer = JGAudio._sounds[name];
			source.connect( gainNode );
			if (loop) source.loop = true;
			
			source.start(0);
			return source; //DS:
		}
	} else {
		var audio = JGAudio._loadFile(JGAudio._sounds[name]);
		// http://stackoverflow.com/questions/3273552/html-5-audio-looping
		if (loop) audio.loop = true;
		audio.volume = 0.5;
		audio.play();
		return audio;
		//audio.preload="auto";
		//audio.addEventListener("canplay", function() { alert("canplay"); audio.play(); });
	}
}

//DS: untested for webaudio
JGAudio.pause = function( source ) 
{
	//if (typeof JGAudio._sounds[name] == "undefined") return;
	if( !source ) return
	
	if (JGAudio._context) {
		//var source = JGAudio._context.createBufferSource();
		//source.buffer = JGAudio._sounds[name];
		//source.connect(JGAudio._context.destination);
		source.stop(0); 
	} else {
		source.pause();
	}
}

//DS: Wrapper class for JGAudio sounds
JGAudio.idx = 0
function Sound( id, file )
{
	var self = this
	this.id = id
	this.file = file
	this.source = null
	
    this.Play = function( loop, delay, gap ) 
	{ 
		if( !delay ) self.source = JGAudio.play( self.id, "main", loop, gap ) 
		else setTimeout( function(){ self.source = JGAudio.play( self.id, "main", loop, gap )}, delay ) 
	}

    this.Pause = function() {
        JGAudio.pause( self.source )
		self.source = null
    }
}


