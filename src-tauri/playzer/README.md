# Playlist Laser aka Playzer

It is a law of nature, playlists always become filled with duplicate and deleted files. With _Playzer_ that no longer has to be the case. Built with Rust, this blazingly-fast<sup>TM</sup> CLI tool lets you get ahold of your unwieldly playlists. All you have to do is download the binary in the releases tab and run it!

## Instructions
### Using the Binary

Run the executable and follow the instructions. You can also provide arguments to the executable.  
1. First argument is the path to the playlist you want to clean, absolute or relative. If there are spaces, it has to be surrounded with double quotes.
1. Second is the output format: m3u, pls, asx or mpcpl.
1. Third is options. Order doesn't matter.
   * s - shuffle
   * d - keep duplicates
1. Other directories you'd like to include in the playlist separated by spaces and surrounded by quotes if there are spaces in the pathnames. Note: currently this adds all files from these directories - media file or not.

Example   
```ps
.\playzer "C:\John Doe\music\90s.pls" m3u s D:\
```

### Using Cargo
Alternatively, if you have rust installed, you can clone this repo and supply the above-mentioned arguments to ```cargo run --```.  
Example   
```ps1 
cargo run -- Y:\music.asx pls . "C:\John Doe\music" D:\
```