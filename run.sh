#!/bin/bash
set -e

# Check if a specific Meteor release is required...
if [ -z "${METEOR_RELEASE}" ] ; then
  echo "No Meteor release specified, using latest 1.2 release..."
  export METEOR_RELEASE=1.2.1
fi

# Make sure the specified patch version is part of this image's minor version...
if [[ !("${METEOR_RELEASE}" =~ ^1\.2\..*) ]] ; then
  echo "ERROR: Specified release isn't a 1.2 release!"
  echo "Please use the appropriate image version for your project!"
  exit 1
fi
echo "Using Meteor v$METEOR_RELEASE..."

echo "Using $SRC_BASE as source base dir and $BUILD_BASE as build base dir..."

# Start the app in development mode...
if [ "$APP_ENV" == "development" ] ; then

  echo "Starting app in development mode..."

  # Use custom settings file...
  if [ -f "$SRC_BASE/settings.json" ] ; then
    echo "Detected settings.json file!"
    if [ -z "${METEOR_RELEASE}" ] ; then
      meteor --port $PORT --settings $SRC_BASE/settings.json
    else
      meteor --release $METEOR_RELEASE --port $PORT --settings $SRC_BASE/settings.json
    fi

  # Use default settings file, if provided...
  elif [ -f "$SRC_BASE/settings-default.json" ] ; then
    echo "No settings file detected, using default!"
    if [ -z "${METEOR_RELEASE}" ] ; then
      meteor --port $PORT --settings $SRC_BASE/settings-default.json
    else
      meteor --release $METEOR_RELEASE --port $PORT --settings $SRC_BASE/settings-default.json
    fi

  # Start without settings file...
  else
    echo "No settings file detected, moving on..."
    if [ -z "${METEOR_RELEASE}" ] ; then
      meteor --port $PORT
    else
      meteor --release $METEOR_RELEASE --port $PORT
    fi
  fi

# Start the app in production mode...
elif [ "$APP_ENV" == "production" ] ; then

  echo "Beginning new production build of Meteor app..."

  if [ -d "$BUILD_BASE/" ] ; then
    echo "Purging old build and resetting project..."
    rm -rf $BUILD_BASE/*
    meteor reset
  fi

  echo "Beginning full build..."
  if [ -z "${METEOR_RELEASE}" ] ; then
    meteor build $BUILD_BASE/ --architecture os.linux.x86_64
    meteor reset
  else
    meteor --release $METEOR_RELEASE build $BUILD_BASE/ --architecture os.linux.x86_64
    meteor --release $METEOR_RELEASE reset
  fi

  # And extract the resulting tarball.
  cd $BUILD_BASE/
  echo "Unpacking build tarball..."
  tar -xf src.tar.gz

  # Install required npm packages locally for the node app.
  cd bundle/programs/server
  echo "Installing required npm packages..."
  npm install

  # Create METEOR_SETTINGS env variable.
  # Use custom settings file...
  if [ -f "$SRC_BASE/settings.json" ] ; then
    echo "Detected settings file:"
    cat $SRC_BASE/settings.json
    export METEOR_SETTINGS=$(cat $SRC_BASE/settings.json | tr -d '\n')

  # Use default settings file, if provided...
  elif [ -f "$SRC_BASE/settings-default.json" ] ; then
    echo "No settings file detected, using default:"
    cat $SRC_BASE/settings-default.json
    export METEOR_SETTINGS=$(cat $SRC_BASE/settings-default.json | tr -d '\n')

  # Start without settings file...
  else
    echo "No settings file detected, moving on..."
  fi

  # Run the main.js node serverfile on a seperate forever instance.
  #     Forever also auto-restarts server in case of a fatal crash.
  cd ../../
  echo "Starting server on port $PORT..."

  if [ "$PORT" -lt 1024 ]; then
    echo "ERROR: Running your application on a port lower than 1024 is highly discouraged, as this requires root!"
    echo "If you only want to run on port 80, please use a reverse proxy like NGinX instead!"
    exit 1
  else
    rm /home/web/.forever/meteorapp.log
    forever start -l meteorapp.log main.js
    forever list
    tail -f /home/web/.forever/meteorapp.log
  fi

else

  echo "\$APP_ENV wasn't defined! Please set it to either 'development' or 'production'!"

fi
