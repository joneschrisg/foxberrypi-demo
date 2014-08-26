#!/bin/bash

export SYSROOT="/home/pi/ffos/sysroot"
export LD_LIBRARY_PATH="$SYSROOT/lib:$SYSROOT/usr/lib/b2g:$SYSROOT/usr/lib:$LD_LIBRARY_PATH"
$SYSROOT/lib/ld-linux.so.3 "$@"
