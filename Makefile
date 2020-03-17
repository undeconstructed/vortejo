
site:
	rm -r ../vortejo-pub/*
	# how did it come to this?
	HUGO_PARAMS_VORTAROURL="/vortaro" hugo -d ../vortejo-pub/
	rm -r ../vortejo-pub/vortaro/*.json
