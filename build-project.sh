#!/bin/bash
VERSION="$1"

docker build -t gsf-tracker:$VERSION .
docker tag gsf-tracker:$VERSION gcr.io/gsf-tracker/gsf-tracker:$VERSION
docker push gcr.io/gsf-tracker/gsf-tracker:$VERSION