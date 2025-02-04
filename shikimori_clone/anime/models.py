from django.db import models

class Anime(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    episodes = models.IntegerField()
    score = models.FloatField()
    image_url = models.URLField()
    
    def __str__(self):
        return self.title