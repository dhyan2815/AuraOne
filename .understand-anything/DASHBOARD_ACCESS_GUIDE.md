# Understand Anything Dashboard Access Guide

This guide shows exactly how to start the local dashboard and open it with a tokenized URL.

## What This Dashboard Reads

The dashboard reads your project graph from:

`<YOUR_PROJECT>/.understand-anything/knowledge-graph.json`

For AuraOne, that path is:

`C:\Users\dhyan\Documents\DP Code's\Web Stack\TypeScripts\AuraOne\.understand-anything\knowledge-graph.json`

## Start the Dashboard (PowerShell)

Run these commands in PowerShell from:

`C:\Users\dhyan\.understand-anything\repo\understand-anything-plugin\packages\dashboard`

```powershell
$env:GRAPH_DIR="C:\Users\dhyan\Documents\DP Code's\Web Stack\TypeScripts\AuraOne"
$env:UNDERSTAND_ACCESS_TOKEN="auraone-kg-20260514"
& "C:\Program Files\nodejs\npx.cmd" vite --host 127.0.0.1 --port 5174
```

## Open in Browser

Use this URL:

`http://127.0.0.1:5174/?token=auraone-kg-20260514`

## Stop the Dashboard

Press `Ctrl + C` in the same terminal where Vite is running.

## Quick Troubleshooting

- `127.0.0.1 refused to connect`
  - The dashboard server is not running. Start it again with the commands above.
- `Access Token Required` or `Forbidden: missing or invalid token`
  - Open the URL with `?token=...` and ensure the token matches `UNDERSTAND_ACCESS_TOKEN`.
- Graph info panel works but canvas is empty
  - Ensure the graph file includes `layers` and `tour` metadata, then restart the dashboard.
