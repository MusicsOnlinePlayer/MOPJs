# React Audio Player
This is a light React wrapper around the HTML5 audio tag.  It provides the ability to manipulate the player and listen to events through a nice React interface.

## Installation

    npm install --save react-audio-player

Also be sure you have `react` and `react-dom` installed in your app at version 15 or above.

## Usage

    import ReactAudioPlayer from 'react-audio-player';
    //...
    <ReactAudioPlayer
      src="my_audio_file.ogg"
      autoPlay
      controls
    />

### Example

See the example directory for a basic working example of using this project.  To run it locally, run `npm install` in the example directory and then `npm start`.

## Props

### Props - Native/React Attributes
See the [audio tag documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio) for detailed explanations of these attributes.

#### autoPlay {Bool} [false]

#### children {Element} [null]

#### className {String} ['']

#### controls {Bool} [false]

#### crossOrigin {String} ['']
See [MDN's article on CORS](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for more about this attribute.

#### controlsList {String} ['']
_For Chrome 58+. Only available in React 15.6.2+_

#### id {String} ['']

#### loop {Bool} [false]

#### muted {Bool} [false]

#### volume {Number} [1.0]

#### preload {String} ['metadata']

#### src {String} ['']

#### style {Object} [{}]

### Props - Events

#### listenInterval {Number} [10000]
Indicates how often to call the `onListened` prop during playback, in milliseconds.

#### onAbort {Function}
Called when unloading the audio player, like when switching to a different src file. Passed the event.

#### onCanPlay {Function}
Called when enough of the file has been downloaded to be able to start playing.  Passed the event.

#### onCanPlayThrough {Function}
Called when enough of the file has been downloaded to play through the entire file.  Passed the event.

#### onEnded {Function}
Called when playback has finished to the end of the file. Passed the event.

#### onError {Function}
Called when the audio tag encounters an error. Passed the event.

#### onListen {Function}
Called every `listenInterval` milliseconds during playback.  Passed the event.

#### onPause {Function}
Called when the user pauses playback. Passed the event.

#### onPlay {Function}
Called when the user taps play.  Passed the event.

#### onSeeked {Function}
Called when the user drags the time indicator to a new time. Passed the event.

#### onVolumeChanged {Function}
Called when the user changes the volume, such as by dragging the volume slider.

#### onLoadedMetadata {Function}
Called when the metadata for the given audio file has finished downloading.  Passed the event.

## Advanced Usage

### Access to the audio element
You can get direct access to the underlying audio element.  First get a ref to ReactAudioPlayer:

    <ReactAudioPlayer
      ref={(element) => { this.rap = element; }}
    />

Then you can access the audio element like this:

    this.rap.audioEl

This is especially useful if you need access to read-only attributes of the audio tag such as `buffered` and `played`.  See the [audio tag documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio) for more on these attributes.
