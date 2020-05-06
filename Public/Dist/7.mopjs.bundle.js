(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[7],{

/***/ "./Public/Js/Components/Containers/PlaylistContainer.jsx":
/*!***************************************************************!*\
  !*** ./Public/Js/Components/Containers/PlaylistContainer.jsx ***!
  \***************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-redux */ \"./node_modules/react-redux/es/index.js\");\n/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! prop-types */ \"./node_modules/prop-types/index.js\");\n/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Elements_PlaylistElement__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Elements/PlaylistElement */ \"./Public/Js/Components/Elements/PlaylistElement.jsx\");\n/* harmony import */ var _Actions_Action__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../Actions/Action */ \"./Public/Js/Actions/Action.jsx\");\nfunction _typeof(obj) { \"@babel/helpers - typeof\"; if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nfunction _createSuper(Derived) { return function () { var Super = _getPrototypeOf(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }\n\nfunction _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) { return call; } return _assertThisInitialized(self); }\n\nfunction _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return self; }\n\nfunction _isNativeReflectConstruct() { if (typeof Reflect === \"undefined\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \"function\") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }\n\nfunction _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }\n\nfunction _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n\n\n\n\n\n\nvar mapStateToProps = function mapStateToProps(state) {\n  return {\n    Musics: state.MusicPlayerReducer.Playlist.Musics,\n    CurrentPlaying: state.MusicPlayerReducer.Playlist.Musics[state.MusicPlayerReducer.Playlist.PlayingId]\n  };\n};\n\nvar mapDispatchToProps = function mapDispatchToProps(dispatch) {\n  return {\n    ChangePlayingId: function ChangePlayingId(id) {\n      dispatch(Object(_Actions_Action__WEBPACK_IMPORTED_MODULE_4__[\"ChangePlayingId\"])(id));\n    }\n  };\n};\n\nvar PlaylistContainerConnected = /*#__PURE__*/function (_React$Component) {\n  _inherits(PlaylistContainerConnected, _React$Component);\n\n  var _super = _createSuper(PlaylistContainerConnected);\n\n  function PlaylistContainerConnected() {\n    var _this;\n\n    _classCallCheck(this, PlaylistContainerConnected);\n\n    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {\n      args[_key] = arguments[_key];\n    }\n\n    _this = _super.call.apply(_super, [this].concat(args));\n\n    _defineProperty(_assertThisInitialized(_this), \"HandlePlaylistItemClick\", function (id) {\n      var ChangePlayingId = _this.props.ChangePlayingId;\n      ChangePlayingId(id);\n    });\n\n    return _this;\n  }\n\n  _createClass(PlaylistContainerConnected, [{\n    key: \"render\",\n    value: function render() {\n      var _this2 = this;\n\n      var _this$props = this.props,\n          Musics = _this$props.Musics,\n          CurrentPlaying = _this$props.CurrentPlaying;\n      var PlaylistItems = Musics.map(function (Music) {\n        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Elements_PlaylistElement__WEBPACK_IMPORTED_MODULE_3__[\"default\"], {\n          key: Musics.indexOf(Music),\n          ChangePlayingId: _this2.HandlePlaylistItemClick,\n          Music: Music,\n          IsThisPlaying: CurrentPlaying.id === Music.id,\n          PlaylistId: Musics.indexOf(Music)\n        });\n      });\n      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: \"m-4\"\n      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"small\", {\n        className: \"text-muted\"\n      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"h5\", null, \"Current Playlist\")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"table\", {\n        className: \"table table-hover\"\n      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"tbody\", null, PlaylistItems)));\n    }\n  }]);\n\n  return PlaylistContainerConnected;\n}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);\n\n_defineProperty(PlaylistContainerConnected, \"propTypes\", {\n  ChangePlayingId: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.func.isRequired,\n  Musics: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.array.isRequired,\n  CurrentPlaying: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.shape({\n    id: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string\n  }).isRequired\n});\n\nvar PlaylistContainer = Object(react_redux__WEBPACK_IMPORTED_MODULE_1__[\"connect\"])(mapStateToProps, mapDispatchToProps)(PlaylistContainerConnected);\n/* harmony default export */ __webpack_exports__[\"default\"] = (PlaylistContainer);\n\n//# sourceURL=webpack:///./Public/Js/Components/Containers/PlaylistContainer.jsx?");

/***/ }),

/***/ "./Public/Js/Components/Elements/PlaylistElement.jsx":
/*!***********************************************************!*\
  !*** ./Public/Js/Components/Elements/PlaylistElement.jsx ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! prop-types */ \"./node_modules/prop-types/index.js\");\n/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _Items_MusicItemRow__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Items/MusicItemRow */ \"./Public/Js/Components/Items/MusicItemRow.jsx\");\nfunction _typeof(obj) { \"@babel/helpers - typeof\"; if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nfunction _createSuper(Derived) { return function () { var Super = _getPrototypeOf(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }\n\nfunction _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) { return call; } return _assertThisInitialized(self); }\n\nfunction _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return self; }\n\nfunction _isNativeReflectConstruct() { if (typeof Reflect === \"undefined\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \"function\") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }\n\nfunction _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }\n\nfunction _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n\n\n\n\nvar PlaylistElement = /*#__PURE__*/function (_React$Component) {\n  _inherits(PlaylistElement, _React$Component);\n\n  var _super = _createSuper(PlaylistElement);\n\n  function PlaylistElement() {\n    var _this;\n\n    _classCallCheck(this, PlaylistElement);\n\n    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {\n      args[_key] = arguments[_key];\n    }\n\n    _this = _super.call.apply(_super, [this].concat(args));\n\n    _defineProperty(_assertThisInitialized(_this), \"onPlaylistClick\", function () {\n      var _this$props = _this.props,\n          ChangePlayingId = _this$props.ChangePlayingId,\n          PlaylistId = _this$props.PlaylistId;\n      ChangePlayingId(PlaylistId);\n    });\n\n    return _this;\n  }\n\n  _createClass(PlaylistElement, [{\n    key: \"render\",\n    value: function render() {\n      var Music = this.props.Music;\n      var Image = Music.Image,\n          Title = Music.Title,\n          Artist = Music.Artist,\n          ImagePathDeezer = Music.ImagePathDeezer;\n      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Items_MusicItemRow__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n        Image: Image || undefined,\n        ImageDz: ImagePathDeezer || undefined,\n        Title: Title,\n        Artist: Artist,\n        onClick: this.onPlaylistClick,\n        isAvailable: true\n      });\n    }\n  }]);\n\n  return PlaylistElement;\n}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);\n\n_defineProperty(PlaylistElement, \"propTypes\", {\n  ChangePlayingId: prop_types__WEBPACK_IMPORTED_MODULE_1___default.a.func.isRequired,\n  PlaylistId: prop_types__WEBPACK_IMPORTED_MODULE_1___default.a.number.isRequired,\n  Music: prop_types__WEBPACK_IMPORTED_MODULE_1___default.a.shape({\n    Title: prop_types__WEBPACK_IMPORTED_MODULE_1___default.a.string.isRequired,\n    Artist: prop_types__WEBPACK_IMPORTED_MODULE_1___default.a.string.isRequired,\n    Image: prop_types__WEBPACK_IMPORTED_MODULE_1___default.a.string,\n    ImagePathDeezer: prop_types__WEBPACK_IMPORTED_MODULE_1___default.a.string\n  }).isRequired\n});\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (PlaylistElement);\n\n//# sourceURL=webpack:///./Public/Js/Components/Elements/PlaylistElement.jsx?");

/***/ }),

/***/ "./Public/Js/Components/Items/MusicItemRow.jsx":
/*!*****************************************************!*\
  !*** ./Public/Js/Components/Items/MusicItemRow.jsx ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! prop-types */ \"./node_modules/prop-types/index.js\");\n/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap */ \"./node_modules/react-bootstrap/esm/index.js\");\n\n\n\n\nvar MusicItemRow = function MusicItemRow(_ref) {\n  var onClick = _ref.onClick,\n      Image = _ref.Image,\n      ImageDz = _ref.ImageDz,\n      Title = _ref.Title,\n      Artist = _ref.Artist,\n      children = _ref.children,\n      isAvailable = _ref.isAvailable;\n  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"tr\", {\n    className: \"w-100 mx-0 p-1 \"\n  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"td\", {\n    className: \"align-middle py-2\",\n    onClick: onClick,\n    style: {\n      width: '50px'\n    }\n  }, ImageDz ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__[\"Image\"], {\n    className: \"PlayerImage my-auto\",\n    rounded: true,\n    height: \"50em\",\n    src: ImageDz\n  }) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__[\"Image\"], {\n    className: \"PlayerImage my-auto\",\n    rounded: true,\n    height: \"50em\",\n    src: Image ? \"data:image/jpeg;base64,\".concat(Image.toString('base64')) : '/Ressources/noMusic.jpg'\n  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"td\", {\n    className: \"align-middle text px-1 py-1\",\n    style: {\n      maxHeight: '50em'\n    },\n    onClick: onClick\n  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"span\", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", {\n    className: isAvailable ? '' : 'font-italic'\n  }, Title))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"td\", {\n    className: \"align-middle py-1\",\n    onClick: onClick\n  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", {\n    className: \"text-middle\"\n  }, Artist)), children);\n};\n\nMusicItemRow.propTypes = {\n  onClick: prop_types__WEBPACK_IMPORTED_MODULE_1___default.a.func.isRequired,\n  Image: prop_types__WEBPACK_IMPORTED_MODULE_1___default.a.string,\n  ImageDz: prop_types__WEBPACK_IMPORTED_MODULE_1___default.a.string,\n  Title: prop_types__WEBPACK_IMPORTED_MODULE_1___default.a.string.isRequired,\n  Artist: prop_types__WEBPACK_IMPORTED_MODULE_1___default.a.string.isRequired,\n  children: prop_types__WEBPACK_IMPORTED_MODULE_1___default.a.element,\n  isAvailable: prop_types__WEBPACK_IMPORTED_MODULE_1___default.a.bool.isRequired\n};\nMusicItemRow.defaultProps = {\n  Image: undefined,\n  ImageDz: undefined,\n  children: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null)\n};\n/* harmony default export */ __webpack_exports__[\"default\"] = (MusicItemRow);\n\n//# sourceURL=webpack:///./Public/Js/Components/Items/MusicItemRow.jsx?");

/***/ })

}]);