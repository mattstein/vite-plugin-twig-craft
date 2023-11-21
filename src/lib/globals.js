const globalVars = {
  // craft
  // currentSite
  // currentUser
  siteName: () => {
    return "My Site"
  },
  siteUrl: (path = "") => {
    return "https://mysite.foo/" + (path ? path : "")
  },
  // systemName
  // view
  devMode: () => {
    return false
  },
  // isInstalled
  // loginUrl
  // logoutUrl
  // setPasswordUrl
  now: () => {
    return new Date()
  },
  // today
  // tomorrow
  // yesterday
}

export default globalVars
