#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <assert.h>


#define NUMINPUTS 2
#define SEEDLENGTH 10

uint64_t xorshift128plus(uint64_t* s);
void seedGen(uint64_t* s,int seedLength, char* input);

int main(int argc, char** argv){
	uint64_t s[2];
	seedGen(s,SEEDLENGTH, *(argv+1));
	uint64_t* r = (uint64_t*)malloc(sizeof(uint64_t));
	*r = xorshift128plus(s);

	/*
	Slight problem here that needs to be resolved. The prng
	is approx uniform for base 2, but in converting 
	to base 10 we disrupt the distribution.

	2^64 = 1.84*10^19
	since extracting to base 10 will be greater freq of 1
	so greedy sol is to remove digits (how many?) to get
	a better dist.
	a decent first guess is 4 since 2^60 = 1.15*10^18.

	Long term need a base converting function.*/

	//this just sets leading 4 bits of *r to 0
	*r = *r<<4;
	*r = *r>>4;

	//printf to stdout, more available with right print option
	printf("%llu",*r);
	free(r);
	return 0;
}
/* This was found on https://en.wikipedia.org/wiki/Xorshift
and apparently is attributted to Vigna, Sebastiano.
Generates a pseudo random (uniform) distribution from an
initial seed.
*/
uint64_t xorshift128plus(uint64_t* s) {
	uint64_t x = s[0];
	//TO DO, may have misunderstood this function, looks like
	//s[1] is also part of the seed.
	uint64_t const y = s[1];
	s[0] = y;
	x ^= x << 23; // a
	s[1] = x ^ y ^ (x >> 17) ^ (y >> 26); // b, c
	return s[1] + y;
}
/*Generates a seed from the input string
assumes each input char in asci range [0,127]
127==2^7-1, so each input char contains up to 7 bits
64/7=10 rounding up, so want a seed length of 10.*/
void seedGen(uint64_t* s,int seedLength, char* input){
	int i=0;
	*s=0;
	for (i=0;i<seedLength;i++){
		//just draws zeroes from the right
		*(s) = *(s)<<7;
		*(s) += *(input+i);		
	}
}