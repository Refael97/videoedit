"""Environment for the node helpers (probe.cjs, scenes.cjs): they `require("playwright")`, which may live in the global
npm root or in a project's node_modules rather than next to the scripts."""
import os, pathlib, subprocess

ROOT = pathlib.Path(__file__).resolve().parents[5]


def env():
    e = dict(os.environ)
    paths = [p for p in e.get("NODE_PATH", "").split(os.pathsep) if p]
    try:
        paths.append(subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip())
    except OSError:
        pass
    paths += [str(p) for p in ROOT.glob("*/*/node_modules") if (p / "playwright").exists()]
    paths += [str(p) for p in ROOT.glob("node_modules") if (p / "playwright").exists()]
    cache = pathlib.Path.home() / ".cache/video-themes-node/node_modules"  # a private install outside the repo
    if (cache / "playwright").exists():
        paths.append(str(cache))
    e["NODE_PATH"] = os.pathsep.join(dict.fromkeys(p for p in paths if p))
    return e
