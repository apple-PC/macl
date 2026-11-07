#!/usr/bin/env python3
"""每日统计快照：把 GitHub Releases 的真实下载数写进 assets/stats.json。

刻意**只抓下载数**，不抓页面访问：
- GitHub 的 /traffic/views 只统计仓库页面，不统计 GitHub Pages，拿它冒充网站访问量是假的
- 不蒜子这类前端计数器是按请求累加的，服务端定时抓一次就会凭空多一次访问

所以页面访问交给浏览器实时读取，这里只负责可核查、无副作用的下载历史。
每天一次 commit，历史就在仓库里，谁都能翻。
"""

import json
import os
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATS = ROOT / "assets" / "stats.json"
REPO = os.environ.get("REPO", "apple-PC/macl")
TOKEN = os.environ.get("GH_TOKEN", "")
CST = timezone(timedelta(hours=8))


def releases() -> list:
    req = urllib.request.Request(
        f"https://api.github.com/repos/{REPO}/releases?per_page=100",
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "macl-stats-snapshot",
            **({"Authorization": f"Bearer {TOKEN}"} if TOKEN else {}),
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def main() -> None:
    data = releases()
    by_release = {
        r["tag_name"]: sum(a.get("download_count", 0) for a in r.get("assets", []))
        for r in data
    }
    total = sum(by_release.values())

    stats = json.loads(STATS.read_text(encoding="utf-8")) if STATS.exists() else {}
    stats["schema"] = 1
    stats["updatedAt"] = datetime.now(CST).isoformat(timespec="seconds")
    stats["downloads"] = {"total": total, "byRelease": by_release}
    stats.setdefault("pageViews", {
        "source": "busuanzi",
        "sitePv": None,
        "siteUv": None,
        "note": "由浏览器实时读取；不做服务端抓取，避免制造假访问",
    })
    stats.setdefault("sources", {
        "downloads": f"https://api.github.com/repos/{REPO}/releases",
        "pageViews": "https://busuanzi.ibruce.info",
    })

    today = datetime.now(CST).strftime("%Y-%m-%d")
    history = [h for h in stats.get("history", []) if h.get("date") != today]
    history.append({"date": today, "downloads": total})
    history.sort(key=lambda h: h["date"])
    stats["history"] = history[-400:]

    STATS.write_text(json.dumps(stats, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{today}: 累计下载 {total}，分版本 {by_release}")


if __name__ == "__main__":
    main()
