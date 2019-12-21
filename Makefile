SCSS_SOURCE = ./src/scss
CSS_DESTINATION = ./assets/css 
TYPESCRIPT_SOURCE = ./src/ts

.PHONY: build sass typescript
build: sass typescript

sass: $(shell find ${SCSS_SOURCE} -name '*.scss')
	sass ${SCSS_SOURCE}:${CSS_DESTINATION}

typescript: $(shell find ${TYPESCRIPT_SOURCE} -name '*.ts')
	tsc