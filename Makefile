.PHONY: deploy format update

.SILENT:

deploy:
	gcloud config set run/region us-central1
	gcloud run deploy scraper --source $(shell pwd) --platform managed --allow-unauthenticated --project getscheduler

format:
	npm run format

update:
	npx npm-upgrade