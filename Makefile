build:
	docker build -t tgbot .
run: 
	docker rund -d -p 3000:3000c--name tgbot -rm tgbot