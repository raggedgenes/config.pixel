var dat = require('dat.gui');
var addGlobalViewSettings = require('config.view');
var addLayoutSettings = require('config.layout');

module.exports = createSettingsView;

function createSettingsView(renderer) {
  var gui;
  var settingsAreVisible = true;

  var api = {
    show: show,
    destroy: destroy,
    gui: getGUI,
    /**
     * List all available settings
     */
    list: listSettings,

    /**
     * Remove individual settings
     *
     * @param {Array} list of strings, settings identifiers that we want to remove
     */
    remove: remove,
    renderer: getRenderer,
  };

  initGUI();

  return api;

  function getRenderer() {
    return renderer;
  }

  function remove(list) {
    if (!list) return;

    var settings = listSettings();
    var removed = [];
    for (var i = 0; i < list.length; ++i) {
      var setting = settings[list[i]];
      if (setting) {
        if (setting.isFolder) {
          setting.parent.removeFolder(setting.name);
        } else {
          setting.controller.remove();
        }
        removed.push(setting);
      }
    }

    return removed;
  }

  function listSettings() {
    var flastList = Object.create(null);
    var root = gui;
    addToList(root);

    return flastList;

    function addToList(root) {
      for (var i in root.__controllers) {
        var controller = root.__controllers[i];
        var name = controller.property;
        flastList[name] = {
          name: name,
          parent: root,
          controller: controller
        };
      }

      Object.keys(root.__folders).forEach(addFolder);

      function addFolder(key) {
        var folder = root.__folders[key];
        var name = folder.name;
        flastList[name] = {
          name: folder.name,
          parent: root,
          isFolder: true,
          controller: folder
        };
        addToList(folder);
      }
    }
  }

  function getGUI() {
    return gui;
  }

  function destroy() {
    if (gui) {
      gui.destroy();
      gui = null;
      settingsAreVisible = false;
    }
  }

  function show(isVisible) {
    if (isVisible === undefined) {
      return settingsAreVisible;
    }

    if (!isVisible && gui) {
      gui.close();
    } else if (isVisible && !gui) {
      initGUI();
    } else if (isVisible && gui) {
      gui.open();
    }

    settingsAreVisible = isVisible;
  }

  function initGUI() {
    gui = new dat.GUI( { autoPlace: false } );
    addGlobalViewSettings(api);
    addLayoutSettings(api);
  }
}
