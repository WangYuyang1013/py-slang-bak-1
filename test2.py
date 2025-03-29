def aaa(m):
    if m == 1:
        return 1
    else: 
        return m * aaa(m-1)

a = 6
res = aaa(a)
str1 = 'source'
str2 = 'source'
str3 = 'academy'
num1 = 333

res1 = str1 == str2
res2 = str1 == str3
res3 = str1 + str2
res4 = str1 > str3
#res5 = str1 + num1

print(res1, res2, res3, res4)

add_lambda = lambda x, y: x + y

x1 = 8
x2 = 98.678
add_res = add_lambda(x1, x2)
