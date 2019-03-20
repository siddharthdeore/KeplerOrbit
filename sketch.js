var e=0.2;
var a=200;
var M0=0;
var omega=0.3;
var RA=0.6;
var inc=-0.6;
var plist=[];
function setup() {
	createCanvas(windowWidth, windowHeight,WEBGL);
	//createCanvas(windowWidth, windowHeight);

	stroke(0);
	background(0);
	//line(windowWidth/2,0,windowWidth/2,windowHeight);
	smooth();
}
function draw() {
	background(0);
	rotateX(1.4);
	rotateZ(-1);
	ambientLight(160, 160, 160);
	pointLight(255, 255, 255, 300, 300, 100);

	//getConics(a,e);
	getKeplerOrbit(a,e,0,RA,omega)
	//for (var i = plist.length - 1; i >= 0; i--) {
		//plist[frameCount%200].show();
	//}

	orbitControl();
}


function getKeplerOrbit(a,e,i,RA,omega) {
	//background(255);
	let p = 0;
	let min = -1;
	let max = 1;
	stroke(100,100,100,100);
	line(-500,0,0,500,0,0);
	line(0,-500,0,0,500,0);
	line(0,0,-500,0,0,500);
	//line(0,windowHeight/2,windowWidth,windowHeight/2);
	let f = a;
	noStroke();
	if (e==0) {
		//text("circle",10,10);
		p=a*(1-e*e);
		min = 0;
		max = 2*Math.PI;
		f = a*e;
	}
	else if (e>0 && e<1) {
		//text("ellipse",10,10);
		p=a*(1-e*e);
		min = 0;
		max = 2*Math.PI;
		f = a*e;
	}
	else if (e==1) {
		//text("Parabola",10,10);
		p=a;
		min = 0;
		max = Math.PI/3;
		f = (a*e-a);
	}
	else {
		//text("Hyperbola",10,10);
		p=a*(e*e-1);
		min = -Math.PI/3;
		max = Math.PI/3;
		f = 2*a-a*e;
	}
	// text("a="+a,10,20);
	// text("e="+e,10,30);
	// text("i="+inc,10,40);
	// text("RA="+RA,10,50);
	// text("omega="+omega,10,60);
	// text("M0="+M0,10,70);

	N=200;
	[peri_x,peri_y,peri_z] =getECI(e,p,0,omega,RA,inc);

	prev_x=peri_x;
	prev_y=peri_y;
	prev_z=peri_z;
	plist=[];
	E=0;t=0;
	for (var i = 1; i < N; i++) {
		[E,t]=invKepler(map(i,0,N-1,min,max),e);
		// 3d plot
		[x,y,z]=getECI(e,p,t,omega,RA,inc);
		// orbit
		stroke(255,40,70,255);
		strokeWeight(2);
		if(dist(x,y,z,prev_x,prev_y,prev_z)<a/2)
			line(x,y,z,prev_x,prev_y,prev_z);
			strokeWeight(1);

		prev_x=x;
		prev_y=y;
		prev_z=z;
		plist.push(new Particle(x,y,z));

	}
	[peri_x,peri_y,peri_z] = getECI(e,p,0,omega,RA,inc);
	[apo_x,apo_y,apo_z] = getECI(e,p,Math.PI,omega,RA,inc);
	[E,t]=invKepler(M0,e);
	[sat_x,sat_y,sat_z] = getECI(e,p,t,omega,RA,inc);
	//line(peri_x,peri_y,peri_z,apo_x,apo_y,apo_z)
	noStroke();
	push();
	translate(0,0,0);
	specularMaterial(0,255,200,230);
	sphere(20);
	ambientMaterial(200,155,155,32);
	plane(800,800);
	pop();
	push();
	translate(sat_x,sat_y,sat_z);
	specularMaterial(255,255,255,220);
	box(10);
	pop();


	push();
	b=a*Math.sqrt(Math.abs(e*e-1));
	rotateZ(RA);
	rotateX(inc);
	rotateZ(-omega);

	specularMaterial(255,255,255,32);
	plane(600,600)
	pop();
	stroke(120,150);
	line(0,0,0,sat_x,sat_y,sat_z)
	line(apo_x,apo_y,apo_z,peri_x,peri_y,peri_z)


}
function getECI(e,p,t,omega,RA,inc){
	r=p/(1+e*cos(t));
	xp=r*Math.cos(t+omega);
	yp=r*Math.sin(t+omega);
	// Rotation of the orbital plane due to the inclination and right ascension
	x = yp*Math.cos(RA) - xp*Math.cos(inc)*Math.sin(RA); 
	y = yp*Math.sin(RA) + xp*Math.cos(inc)*Math.cos(RA); 
	z = xp*Math.sin(inc); 
	return [x,y,z];
}

function invKepler(M,e) {
	// solve for true and Eccentric Anomaly
	let En  = M;
	e=Math.abs(e);
	// Circular
	E=M;
	v=M;
	// Parabolic
	if (e == 1) {
		E = En - (En+En*En*En/3- M)/(En*En+1);
		while (Math.abs(E-En) > 1e-12)
		{
			En = E;
			E = En - (En+En*En*En/3- M)/(En*En+1);
		}
		v=2*Math.atan(E);
	}

	// Eliptic
	if (e>0 && e<1) {
		E = En - (En-e*Math.sin(En)- M)/(1 - e*Math.cos(En));
		while ( Math.abs(E-En) > 1e-12 )
		{
			En = E;
			E = En - (En - e*Math.sin(En) - M)/(1 - e*Math.cos(En));
		}

		sv = Math.sqrt(1 - e * e) * Math.sin(E);
		cv = Math.cos(E) - e;
		v = Math.atan2(sv, cv);
	}

	// Hyperbolic
	if (e>1) {
		E = En - (e*Math.sinh(En)-En- M)/(e*Math.cosh(En)-1);
		while ( Math.abs(E-En) > 1e-12 )
		{
			En = E;
			E = En - (e*Math.sinh(En)-En- M)/(e*Math.cosh(En)-1);
		}
		sv = sqrt(e * e - 1) * Math.sinh(E);
		cv = e - Math.cosh(E);
		v = atan2(sv, cv);
	}
	return [E,v];
}




/////////////////UI functions/////////////////////////
function setecc(arg) {
	e=arg;
}
function seta(arg) {
	a=arg;
}
function setinc(arg) {
	inc=arg*Math.PI/180;
}
function setM0(arg) {
	M0=arg*Math.PI/180;
}
function setomega(arg) {
	omega=arg*Math.PI/180;
}

function setRA(arg) {
	RA=arg*Math.PI/180;
}

function Particle(x,y,z) {
	this.x=x;
	this.y=y;
	this.z=z;
}
Particle.prototype.show = function() {
	push();
	//translate(windowWidth/2,windowHeight/2);
	//ellipse(this.x,this.y,this.z,10,10,10);
	translate(this.x,this.y,this.z);
	specularMaterial(255,0,255,192);
	sphere(5);
	pop();

};

/////
/*
function getConics(a,e) {
	background(255);
	let p = 0;
	let min = -1;
	let max = 1;
	stroke(100,100,100);
	line(windowWidth/2,0,windowWidth/2,windowHeight);
	line(0,windowHeight/2,windowWidth,windowHeight/2);
	let f = a;
	noStroke();
	if (e==0) {
		text("circle",10,10);
		p=a*(1-e*e);
		min = -Math.PI;
		max = Math.PI;
		f = a*e;
	}
	else if (e>0 && e<1) {
		text("ellipse",10,10);
		p=a*(1-e*e);
		min = -Math.PI;
		max = Math.PI;
		f = a*e;
	}
	else if (e==1) {
		text("Parabola",10,10);
		p=a;
		min = -Math.PI;
		max = Math.PI;
		f = (a*e-a);
	}
	else {
		text("Hyperbola",10,10);
		p=a*(e*e-1);
		min = -Math.PI;
		max = Math.PI;
		f = 2*a-a*e;
	}
	text("a="+a,10,20);
	text("e="+e,10,30);

	stroke(0);
	N=1000;
	step=(max-min)/N;
	prev_x=a;
	prev_y=0;
	plist=[];
	for (var i = 0; i < N; i++) {
		//t=i*step;
		t=map(i,0,N-1,min,max)
		r=p/(1+e*cos(t));
		push();
		translate(windowWidth/2,windowHeight/2);
		x=r*cos(t)+0*f;
		y=r*sin(t);
		//x2=a*cos(t);
		//y2=a*sin(t);
		{
			ellipse(x,y,1,1);
		//ellipse(x2,y2,1,1);
		//ellipse(0,0,5,5);
		//ellipse(-f,0,5,5);
	}
	prev_x=x;
	prev_y=y;
	pop();
	plist.push(new Particle(x,y));
}
}
*/
