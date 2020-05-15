PREFIX = .

SUBDIRS =  ${PREFIX}/jslib ${PREFIX}/ecs


all:
	@list='$(SUBDIRS)';\
	for subdir in $$list; do\
		echo "-------- make all in $$subdir ...";\
		(cd $$subdir && make $@);\
	done;


update:
	@list='$(SUBDIRS)';\
	for subdir in $$list; do\
		echo "-------- update in $$subdir";\
		(cd $$subdir && make $@);\
	done;


clean:
	@list='$(SUBDIRS)';\
	for subdir in $$list; do\
		echo "-------- clean in $$subdir";\
        (cd $$subdir && make $@);\
    done;


.PHONY: clean update
