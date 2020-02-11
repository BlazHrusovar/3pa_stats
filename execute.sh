#!/bin/sh

npm install
read -p "Enter player name: " playerName
node scrape.js $playerName
read -p "Press enter to close."