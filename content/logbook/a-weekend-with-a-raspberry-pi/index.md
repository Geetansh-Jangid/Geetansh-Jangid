---
title: "A Weekend with a Raspberry Pi"
description: "Turning a small single-board computer into a useful home service, and the lessons that came with it."
date: 2026-08-22
tags: [Hardware, Linux, Experiments]
category: Experiments
draft: false
featured: false
---

A Raspberry Pi is one of the cheapest ways to make a vague idea concrete. This weekend's idea was a small always-on service: a private dashboard for a few home devices, reachable only from my own network.

## The plan

The requirements were deliberately modest:

- Run on a Pi 4 with 4 GB of RAM.
- Serve a small web app over the local network.
- Survive a power cut without manual intervention.
- Be quiet, cool, and easy to move.

That last point matters more than it sounds. A server you can pick up and put in a drawer is a server you will actually keep.

## Setup

I used a minimal 64-bit image and did the initial configuration over SSH, without ever plugging in a monitor.

```bash
ssh pi@raspberrypi.local
sudo apt update && sudo apt full-upgrade -y
sudo timedatectl set-timezone Asia/Kolkata
```

Setting the timezone early avoids confusing timestamps in logs later, which is the kind of thing you only notice when you are already debugging something else.

## Running the service

The app itself runs in a container. Containers are not free — they add a layer and a little overhead — but they make the dependency story clean. If I break something, I delete the container and start again.

```yaml
services:
  dashboard:
    image: ghcr.io/example/dashboard:latest
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ./data:/app/data
```

`restart: unless-stopped` is doing a lot of work here. After a power cut, the container comes back without me touching anything.

## What went wrong

Two things, predictably.

First, the Pi throttled under load because it was sitting in a closed case with no airflow. Moving it onto a small stand dropped the temperature by about fifteen degrees, which was enough to stop the throttling.

Second, `raspberrypi.local` stopped resolving after a router reboot. mDNS is convenient until it is not. I added a static DHCP lease and started using the IP address for anything that needed to be reliable.

## Was it worth it

Yes, but not for the reasons I expected. The service is useful, but the real value was the reminder that small systems are understandable. There is no orchestration layer, no cloud console, no hidden abstraction. When something breaks, I can trace it from the process to the container to the kernel without leaving the machine.

That is a nice property for a weekend project, and an even nicer one for a tool you plan to keep.
