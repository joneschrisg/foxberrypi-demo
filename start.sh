#!/bin/bash

# TODO: be more flexible about install location
FFOS="/home/pi/ffos"

BIND_MOUNTS="dev proc sys"

function onexit {
    killall webiopi
    killall b2g
    for mnt in $BIND_MOUNTS; do
        umount $SYSROOT/$mnt
    done
}
trap onexit EXIT

sudo webiopi -d -c $FFOS/app/config &

echo Waiting for device server to start ...
sleep 5

export SYSROOT="$FFOS/sysroot"
for mnt in $BIND_MOUNTS; do
    mount --bind /$mnt $SYSROOT/$mnt
done
B2G_HOMESCREEN="http://localhost:8000" chroot $SYSROOT /usr/bin/b2g
