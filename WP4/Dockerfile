FROM ubuntu:22.04

RUN apt-get update && apt-get install -y python3 python3-pip curl net-tools nodejs npm

#RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
#    && apt-get install -y nodejs

RUN npm install -g expo-cli

COPY ./requirements.txt /requirements.txt
RUN pip3 install -r /requirements.txt

COPY ./backend /backend
COPY ./frontend2 /frontend
COPY ./ip_address.sh /frontend
WORKDIR /frontend

RUN ./ip_address.sh
RUN npm install