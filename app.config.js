require('dotenv').config({ path: './.env.local' });

export default {
  "expo": {
    "name": "goship",
    "slug": "goship",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "goship",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.serariel.going",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to show your position on the map and for delivery tracking.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "This app uses background location tracking to share your route with customers while a delivery is in progress.",
        "NSLocationAlwaysUsageDescription": "This app uses background location tracking to share your route with customers while a delivery is in progress."
      },
      "UIBackgroundModes": [
        "location",
        "fetch"
      ]
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "package": "com.serariel.going",
      "scheme": "goship",
      "permissions": [
        "INTERNET",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_BACKGROUND_LOCATION"
      ],
      "usesCleartextTraffic": true
    },
    "plugins": [
      [
        "@maplibre/maplibre-react-native",
        {
          "RNMapboxMapsImpl": "maplibre"
        }
      ],
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": false
          },
          "android": {
            "newArchEnabled": false
          }
        }
      ],
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      "expo-secure-store",
      "expo-font",
      "expo-web-browser",
      "expo-location"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": "https://gosh-ip.com"
      },
      "eas": {
        "projectId": "735f9ad4-92e2-4014-bdeb-fe8c13a214a8"
      },
      "MAPTILER_API_KEY": process.env.MAPTILER_API_KEY,
      "API_URL": process.env.API_URL || "http://192.168.0.196:4000"
    },
    "owner": "serariel"
  }
}
