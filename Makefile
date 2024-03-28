build:
	docker build -t tgbot .
run: 
	docker rund -d -p 3000:3000 --name tgbot -rm tgbot