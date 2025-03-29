def a():
    m1 = b()
    return m1

def b():
    def b1():
        return 4
    m2 = c() + b1()
    return m2

def c():
    m3 = d()
    return m3

def d():
    m4 = 3
    return m4

x = a()
#print(x)
