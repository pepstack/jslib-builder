#!/bin/bash
# replace __LINE__ by line no
# replace __FILE__ by filename
# author: wang xiaodong
# 2012-8-12
line=false
file=false

while getopts n:f:i:o: option
do
  case "$option"
  in 
	n)  change_world="$OPTARG"
	line=true;;

    f)  change_world="$OPTARG"
	file=true;;
    i)	inputfile="$OPTARG";;
    o)	outputfile="$OPTARG";;

    \?) echo "replace.sh -n \"__LINE__\" -i inputfile -o outputfile"
	    echo "replace.sh -f \"__FILE__\" -i inputfile -o outputfile"
	exit 1;;
  esac 
done 

if [ "$OPTIND" -ne 7 ]
then 
  echo "replace.sh  -n __LINE__  -i inputfile -o outputfile"
  echo "replace.sh  -f __FILE__  -i inputfile -o outputfile"
  exit 2
fi

shiftcount=$((OPTIND - 1))
shift $shiftcount

if [ ! -e $inputfile ]
then
  echo "$inputfile: No such file" 
  exit 3
fi

if [ $line = "true"  ]
then 
  sed '=' $inputfile | sed 'N;s/\n/ /g' | awk '{ 
    gsub(change_world, $1)
    sub(/^[0-9]* /,"")
    print
  }' "change_world=$change_world"  > "${outputfile}_1"
  mv "${outputfile}_1" "$outputfile"
fi

if [ $file = "true" ]
then 
  sed 's/'"$change_world"'/'"$outputfile"'/g' $inputfile > "${outputfile}_1"
  mv "${outputfile}_1" "$outputfile"
fi

