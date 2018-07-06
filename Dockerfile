FROM larsvh/meteor:1.2
RUN apt-get install -y --no-install-recommends bsdtar
ADD run.sh /run.sh
