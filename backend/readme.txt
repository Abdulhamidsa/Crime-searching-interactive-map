# Works perfect
> docker-compose up -d



# This are the first try
> docker build -t bottle .
> docker run --name=bottle -p=5000:5000 bottle



# Development server without docker
> python -m bottle --server paste --bind 127.0.0.1:80 --debug --reload app