

//Called when application is started.
function OnStart()
{
    //Lock screen orientation to Landscape and
    //stop screen turning off.
    app.SetOrientation( "Portrait" )
    app.PreventScreenLock( true )
	
    //Create the main layout
    lay = app.CreateLayout( "Linear", "FillXY,VCenter" )
    lay.SetBackColor( "#6666ff" )
	
    //Add the main layout to the app.
    app.AddLayout( lay )
    
    app.SetScreenMode( "Game" )
    
    //Create a GLView and add it to layout.
    glview = app.CreateGameView( 1, 1 )
    glview.SetFile( "corona1.js" )
    glview.SetFrameRate( 60 )
    lay.AddChild( glview )
}




//8bit Dungeon Boss - Video Classica by Kevin MacLeod is licensed under a Creative Commons Attribution license (https://creativecommons.org/licenses/by/4.0/)
//Source: http://incompetech.com/music/royalty-free/index.html?isrc=USUAN1200067
//Artist: http://incompetech.com/

//8bit Dungeon Level - Video Classica by Kevin MacLeod is licensed under a Creative Commons Attribution license (https://creativecommons.org/licenses/by/4.0/)
//Source: http://incompetech.com/music/royalty-free/index.html?isrc=USUAN1200066
//Artist: http://incompetech.com/

//{8_bit_March} by Twin Musicom (twinmusicom.org)
//{Digital Voyage} by Twin Musicom (twinmusicom.org)
//{Mega Rust} by Twin Musicom (twinmusicom.org)
//{NES Boss} by Twin Musicom (twinmusicom.org)