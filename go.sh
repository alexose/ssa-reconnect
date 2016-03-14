while true; do
  echo "Reconnecting...";
  networksetup -setairportpower en0 off; networksetup -setairportpower en0 on; sleep 5 && electron getlogin.js && sleep 3605;
done
