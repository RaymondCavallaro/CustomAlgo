# Docker On Windows

This project can use Docker as a repeatable Node/Expo environment, especially for the mobile app.

The most reliable path for now is to run Docker from Windows PowerShell in the repository folder. Codex can edit the Docker files, but this WSL/Codex environment may not be able to talk to the Docker daemon when Docker Desktop uses the Hyper-V backend.

## Why Codex May Not Reach Docker

With Docker Desktop Hyper-V backend, the Docker engine is exposed on the Windows side as a named pipe. Linux tools usually expect a Unix socket such as:

```txt
/var/run/docker.sock
```

Bridges such as `npiperelay` can forward the Windows named pipe into WSL, but they add moving parts:

- the relay process must be running
- the Unix socket path must exist
- permissions must match the user running Docker
- sandboxed tools may still block socket access
- Docker contexts may point to an endpoint that is not usable from WSL

In this Codex session, Docker CLI is present, but the daemon is not reliably reachable from inside the sandbox.

## Run From Windows PowerShell

From the repository folder:

```powershell
docker compose run --rm mobile npm install
```

Start the Expo dev server:

```powershell
docker compose up mobile
```

Start the Expo web preview:

```powershell
docker compose up mobile-web
```

When running Compose from Windows PowerShell, the default workspace mount is the current repository folder.

When driving Docker from WSL/Codex through a named-pipe relay, set `CUSTOMALGO_WORKSPACE` to a Windows-style path for the repository. Docker Desktop Hyper-V can see Windows paths, but it may not see WSL paths such as `/home/...` or `/mnt/c/...` correctly.

Example shape:

```bash
CUSTOMALGO_WORKSPACE='X:\path\to\CustomAlgo' docker compose config
```

Stop services:

```powershell
docker compose down
```

Reset Docker-installed dependencies:

```powershell
docker compose down -v
```

## What Docker Is Used For

Docker is useful here for:

- installing Node dependencies without relying on host Node
- running Expo's Metro dev server
- running web preview
- later running tests and lint checks

Docker is not enough for every mobile task:

- iOS native builds require macOS/Xcode or EAS cloud builds.
- Android emulator/device workflows may need extra host networking and USB setup.
- Expo QR/device testing may be easier from host Windows Node than from Docker.

## Optional Codex/WSL Bridge Direction

If you want Codex to control Docker directly later, the target state is:

```txt
docker info
```

working inside the Codex shell.

With a named-pipe relay, that usually means:

```txt
Docker Desktop Hyper-V backend
  -> Windows named pipe
  -> npiperelay
  -> WSL Unix socket
  -> Docker CLI
```

Treat this as best-effort. The project should not depend on Codex being able to run Docker directly.
