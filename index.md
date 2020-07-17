---
layout: default
title: "Programming Language Wiki"
---

## Paradigms

<ul>
{% assign sorted_paradigms = site.categories['Paradigm'] | sort %}
{%  for post in sorted_paradigms %}
    <li><a href='{{ site.baseurl }}{{ post.url }}'>{{ post.title }}</a></li>
{% endfor %}
</ul>

## Languages

<ul>
{% assign sorted_langs = site.categories['Language'] | sort:"title" %}
{% for post in sorted_langs %}
    <li><a href='{{ site.baseurl }}{{ post.url }}'>{{ post.title }}</a></li>
{% endfor %}
</ul>
