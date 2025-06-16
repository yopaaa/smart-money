import { getSetting, saveSetting } from "@/utils/fn/settings";
// import { useColorScheme } from 'react-native';

export let colorTheme = null

function reloadColorTheme() {
  console.info("Current colorTheme is", colorTheme);

  try {
    colorTheme = getSetting("@theme") || "white"
  } catch (error) {
    console.info(error)
  }
}

function toogleTheme() {
  console.log(colorTheme);

  if (colorTheme == "light") {
    colorTheme = "dark"
    saveSetting("@theme", "dark")

    return
  }
  colorTheme = "light"
  saveSetting("@theme", "light")

}

function darkTheme() {

  colorTheme = "dark"
  saveSetting("@theme", "dark")
}
reloadColorTheme()

export { darkTheme, reloadColorTheme, toogleTheme };

