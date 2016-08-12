#!env bash

if [ ! -e static/fonts ]
then
	wget https://github.com/Khan/KaTeX/releases/download/v0.6.0/katex.zip &&\
		unzip katex.zip && mv -f katex/* static && rm -r katex katex.zip
fi
